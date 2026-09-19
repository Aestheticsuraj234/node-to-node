"use client";

import { Add01Icon, WorkflowSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

type CanvasEmptyStateProps = {
  onOpenPicker: () => void;
  onAddNode: (nodeType: string) => void;
};

export function CanvasEmptyState({
  onOpenPicker,
  onAddNode,
}: CanvasEmptyStateProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="pointer-events-auto max-w-sm rounded-2xl border bg-background/95 p-8 text-center shadow-sm backdrop-blur-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
          <HugeiconsIcon icon={WorkflowSquare02Icon} strokeWidth={2} className="size-6" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">
          Build your workflow
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with a trigger, then add steps and connect them on the canvas.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="sm" onClick={onOpenPicker}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Browse nodes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNode("manual-trigger")}
          >
            Quick start: Manual Trigger
          </Button>
        </div>
      </div>
    </div>
  );
}
