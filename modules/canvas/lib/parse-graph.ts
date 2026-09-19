import type { WorkflowEdge, WorkflowNode } from "@/modules/canvas/lib/types";

export function parseWorkflowGraph(
  nodes: unknown,
  edges: unknown,
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const parsedNodes = Array.isArray(nodes) ? (nodes as WorkflowNode[]) : [];
  const parsedEdges = Array.isArray(edges)
    ? (edges as WorkflowEdge[]).map((edge) => ({
        ...edge,
        type: edge.type ?? "workflow",
      }))
    : [];

  return { nodes: parsedNodes, edges: parsedEdges };
}
