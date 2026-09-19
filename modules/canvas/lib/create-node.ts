import { getNode } from "@/modules/nodes/lib/index";
import {
  WORKFLOW_NODE_TYPE,
  type WorkflowNode,
} from "@/modules/canvas/lib/types";

export function createWorkflowNode(
  nodeType: string,
  position: { x: number; y: number },
): WorkflowNode {
  const definition = getNode(nodeType);

  return {
    id: crypto.randomUUID(),
    type: WORKFLOW_NODE_TYPE,
    position,
    data: {
      label: definition?.label ?? nodeType,
      nodeType,
      config: nodeType === "ai" ? { provider: "openai" } : {},
      status: "idle",
    },
  };
}
