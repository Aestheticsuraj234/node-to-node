import type { Connection } from "@xyflow/react";
import type { Edge } from "@xyflow/react";

/** Edge metadata — LangGraph compiler reads `branch` for conditional routing */
export type WorkflowEdgeData = {
  branch?: string;
  label?: string;
};

export type WorkflowEdge = Edge<WorkflowEdgeData>;

export function createWorkflowEdge(connection: Connection): WorkflowEdge {
  const branch =
    connection.sourceHandle && connection.sourceHandle !== "out"
      ? connection.sourceHandle
      : undefined;

  return {
    id: `e-${connection.source}-${connection.sourceHandle ?? "out"}-${connection.target}-${connection.targetHandle ?? "in"}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle ?? undefined,
    targetHandle: connection.targetHandle ?? undefined,
    animated: true,
    type: "workflow",
    label: branch,
    data: branch ? { branch, label: branch } : undefined,
  };
}
