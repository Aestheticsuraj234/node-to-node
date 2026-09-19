"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getNode } from "@/modules/nodes/lib/index";
import { NodeIcon } from "@/modules/nodes/components/node-icon";
import type {
  NodeExecutionStatus,
  WorkflowNode,
} from "@/modules/canvas/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<NodeExecutionStatus, string> = {
  idle: "border-border bg-background",
  pending: "border-muted-foreground/35 bg-muted/40",
  running:
    "border-blue-500 bg-blue-500/5 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]",
  success: "border-emerald-500 bg-emerald-500/5",
  error: "border-destructive bg-destructive/5",
};

function portOffset(index: number, total: number) {
  if (total <= 1) return "50%";
  return `${((index + 1) / (total + 1)) * 100}%`;
}

function NodeStatusBadge({
  status,
  errorMessage,
}: {
  status: NodeExecutionStatus;
  errorMessage?: string;
}) {
  if (status === "idle") return null;

  return (
    <span
      title={status === "error" ? errorMessage : status}
      aria-label={status}
      className={cn(
        "absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full border-2 border-background shadow-sm",
        status === "pending" && "bg-muted-foreground/45",
        status === "running" &&
          "animate-pulse bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.85)]",
        status === "success" && "bg-emerald-500 text-white",
        status === "error" && "bg-destructive text-white",
      )}
    >
      {status === "success" && (
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-3" />
      )}
      {status === "error" && (
        <HugeiconsIcon
          icon={Cancel01Icon}
          strokeWidth={2.5}
          className="size-3"
        />
      )}
    </span>
  );
}

function BaseNodeComponent({ data, selected }: NodeProps<WorkflowNode>) {
  const status = data.status ?? "idle";
  const node = getNode(data.nodeType);
  const inputs = node?.inputs ?? [{ id: "in" }];
  const outputs = node?.outputs ?? [{ id: "out" }];
  const isConditional = data.nodeType === "if" || data.nodeType === "switch";

  return (
    <div
      className={cn(
        "relative min-w-[190px] rounded-xl border px-3 py-2.5 shadow-sm transition-colors",
        statusStyles[status],
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        status === "running" && "animate-pulse",
        isConditional && "min-w-[210px] pb-3",
      )}
    >
      <NodeStatusBadge status={status} errorMessage={data.errorMessage} />

      {inputs.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          style={{ top: portOffset(index, inputs.length) }}
          className="!size-2.5 !border-2 !border-background !bg-muted-foreground"
        />
      ))}

      <div className="flex items-center gap-2.5">
        <NodeIcon
          nodeType={data.nodeType}
          config={data.config}
          withBackground
          backgroundClassName={node?.isTrigger ? "ring-1 ring-border" : undefined}
          className="size-9"
          iconClassName="size-[18px]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{data.label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {node?.label ?? data.nodeType.replace(/-/g, " ")}
          </p>
        </div>
      </div>

      {outputs.map((port, index) => (
        <div key={port.id}>
          {port.label && outputs.length > 1 && (
            <span
              className="pointer-events-none absolute right-4 text-[10px] font-medium text-muted-foreground"
              style={{
                top: portOffset(index, outputs.length),
                transform: "translateY(-50%)",
              }}
            >
              {port.label}
            </span>
          )}
          <Handle
            id={port.id}
            type="source"
            position={Position.Right}
            style={{ top: portOffset(index, outputs.length) }}
            className="!size-2.5 !border-2 !border-background !bg-muted-foreground"
          />
        </div>
      ))}
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
