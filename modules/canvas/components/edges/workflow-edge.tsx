"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { WorkflowEdgeData } from "@/modules/canvas/lib/types";

export function WorkflowEdgeComponent(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    data,
    selected,
    style,
  } = props;

  const edgeData = data as WorkflowEdgeData | undefined;
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const displayLabel =
    (typeof label === "string" ? label : undefined) ??
    edgeData?.label ??
    edgeData?.branch;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          strokeWidth: selected ? 2.5 : Number(style?.strokeWidth ?? 1.5),
          stroke: selected
            ? "var(--primary)"
            : String(style?.stroke ?? "var(--muted-foreground)"),
        }}
      />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm"
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
