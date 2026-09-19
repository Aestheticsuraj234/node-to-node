import prisma  from "@/lib/db";
import type { WorkflowNode } from "@/modules/canvas/lib/types";
import type { WorkflowStateType } from "@/modules/engine/lib/state";
import { publishNodeStatus } from "@/modules/inngest/realtime/publish-node-status";
import { runNode } from "@/modules/nodes/executors";

function pickBranch(nodeType: string, config: Record<string, string>, item: any) {
  const key = (config.field || "").replace(/\{\{|\}\}/g, "").trim();

  if (nodeType === "if") {
    const matches = String(item[key] ?? "") === config.value;
    return matches ? "true" : "false";
  }

  if (nodeType === "switch") {
    const val = String(item[key] ?? "");
    for (const line of (config.cases || "").split("\n")) {
      const [caseVal, caseBranch] = line.split(":").map((part) => part.trim());
      if (caseVal && caseVal === val) return caseBranch || "default";
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

    const item = await runNode(nodeType, config, state.item);

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
