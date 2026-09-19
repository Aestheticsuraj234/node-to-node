import prisma from "@/lib/db";
import type { TriggerType } from "@/lib/generated/prisma/client";
import { parseWorkflowGraph } from "@/modules/canvas/lib/parse-graph";
import { startWorkflowExecution } from "@/modules/engine/lib/start-execution";

export async function findActiveWorkflowsByTrigger(nodeType: string) {
  const workflows = await prisma.workflow.findMany({
    where: { active: true },
    select: { id: true, name: true, nodes: true },
  });

  return workflows.filter((workflow) => {
    const { nodes } = parseWorkflowGraph(workflow.nodes, []);
    return nodes.some((node) => node.data.nodeType === nodeType);
  });
}

export async function startActiveTriggerWorkflows(
  nodeType: string,
  trigger: TriggerType,
  payload: Record<string, unknown>,
) {
  const matched = await findActiveWorkflowsByTrigger(nodeType);

  const executionIds = await Promise.all(
    matched.map((workflow) =>
      startWorkflowExecution(workflow.id, trigger, payload),
    ),
  );

  return {
    workflowIds: matched.map((workflow) => workflow.id),
    executionIds,
  };
}
