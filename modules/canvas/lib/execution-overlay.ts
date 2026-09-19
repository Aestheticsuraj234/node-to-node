import type {
  NodeExecutionOverlay,
  NodeExecutionStatus,
  WorkflowEdge,
  WorkflowNode,
} from "@/modules/canvas/lib/types";

const STATUS_RANK: Record<NodeExecutionStatus, number> = {
  idle: 0,
  pending: 1,
  running: 2,
  success: 3,
  error: 3,
};

const EDGE_STROKE: Partial<Record<NodeExecutionStatus, string>> = {
  running: "#3b82f6",
  success: "#10b981",
  error: "var(--destructive)",
};

export function mergeExecutionOverlay(
  current: NodeExecutionOverlay,
  patch: NodeExecutionOverlay,
  mode: "latest" | "monotonic" = "monotonic",
): NodeExecutionOverlay {
  const next = { ...current };

  for (const [nodeId, update] of Object.entries(patch)) {
    const previous = next[nodeId];
    const shouldApply =
      mode === "latest" ||
      !previous ||
      STATUS_RANK[update.status] >= STATUS_RANK[previous.status];

    if (shouldApply) {
      next[nodeId] = update;
    }
  }

  return next;
}

export function applyNodeExecutionOverlay(
  nodes: WorkflowNode[],
  overlay: NodeExecutionOverlay,
  runActive: boolean,
): WorkflowNode[] {
  return nodes.map((node) => {
    const live = overlay[node.id];
    const status = live?.status ?? (runActive ? "pending" : "idle");
    const errorMessage = live?.errorMessage;

    if (
      (node.data.status ?? "idle") === status &&
      node.data.errorMessage === errorMessage
    ) {
      return node;
    }

    return {
      ...node,
      data: {
        ...node.data,
        status,
        errorMessage,
      },
    };
  });
}

export function applyEdgeExecutionOverlay(
  edges: WorkflowEdge[],
  overlay: NodeExecutionOverlay,
  runActive: boolean,
): WorkflowEdge[] {
  return edges.map((edge) => {
    const status =
      overlay[edge.source]?.status ?? (runActive ? "pending" : "idle");
    const stroke = EDGE_STROKE[status];
    const strokeWidth = status === "running" ? 2.25 : stroke ? 1.75 : undefined;
    const animated = status === "running" || Boolean(edge.animated);

    if (
      edge.style?.stroke === stroke &&
      edge.style?.strokeWidth === strokeWidth &&
      edge.animated === animated
    ) {
      return edge;
    }

    return {
      ...edge,
      animated,
      style: stroke
        ? { ...edge.style, stroke, strokeWidth }
        : edge.style,
    };
  });
}
