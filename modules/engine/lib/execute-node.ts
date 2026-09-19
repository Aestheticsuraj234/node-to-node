import prisma  from "@/lib/db";
import type { WorkflowNode } from "@/modules/canvas/lib/types";
import type { WorkflowStateType } from "@/modules/engine/lib/state";
import { publishNodeStatus } from "@/modules/inngest/realtime/publish-node-status";
import { runNode } from "@/modules/nodes/executors";

function getItemValue(item: Record<string, unknown>, field: string) {
  const path = (field || "").replace(/\{\{|\}\}/g, "").trim();
  if (!path) return "";

  let value: unknown = item;
  for (const key of path.split(".")) {
    if (value !== null && typeof value === "object") {
      value = (value as Record<string, unknown>)[key];
    } else {
      return "";
    }
  }

  return value == null ? "" : String(value);
}

function pickBranch(nodeType: string, config: Record<string, string>, item: any) {
  const value = getItemValue(item, config.field).trim();

  if (nodeType === "if") {
    return value === (config.value ?? "").trim() ? "true" : "false";
  }

  if (nodeType === "switch") {
    for (const line of (config.cases || "").split("\n")) {
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      const caseVal = line.slice(0, colon).trim();
      const caseBranch = line.slice(colon + 1).trim();
      if (caseVal && caseVal === value) return caseBranch || "default";
    }
    return "default";
  }

  return "";
}

/** Run one canvas node and write an ExecutionStep row */
export async function executeCanvasNode(
  state: WorkflowStateType,
  node: WorkflowNode,
  executionId: string,
  userId: string,
) {
  const { nodeType, config, label } = node.data;

  const step = await prisma.executionStep.create({
    data: {
      executionId,
      nodeId: node.id,
      nodeName: label,
      nodeType,
      status: "RUNNING",
      input: state.item as any,
    },
  });

  await publishNodeStatus(executionId, { nodeId: node.id, status: "running" });

  try {
    if (nodeType === "if" || nodeType === "switch") {
      const branch = pickBranch(nodeType, config, state.item);
      const output = { branch, item: state.item };

      await prisma.executionStep.update({
        where: { id: step.id },
        data: {
          status: "SUCCESS",
          output: output as any,
          finishedAt: new Date(),
        },
      });

      await publishNodeStatus(executionId, {
        nodeId: node.id,
        status: "success",
        output,
      });

      return { branch, item: state.item };
    }

    const item = await runNode(nodeType, config, state.item, { userId });

    await prisma.executionStep.update({
      where: { id: step.id },
      data: {
        status: "SUCCESS",
        output: item as any,
        finishedAt: new Date(),
      },
    });

    await publishNodeStatus(executionId, {
      nodeId: node.id,
      status: "success",
      output: item,
    });

    return {
      item,
      nodeResults: { [node.id]: item },
    };
  } catch (err: any) {
    const error = err?.message ?? String(err);

    await prisma.executionStep.update({
      where: { id: step.id },
      data: {
        status: "ERROR",
        error,
        finishedAt: new Date(),
      },
    });

    await prisma.execution.update({
      where: { id: executionId },
      data: { status: "ERROR", finishedAt: new Date() },
    });

    await publishNodeStatus(executionId, {
      nodeId: node.id,
      status: "error",
      error,
    });

    throw err;
  }
}
