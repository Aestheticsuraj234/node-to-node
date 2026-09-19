"use client";

import { Add01Icon, WorkflowSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_STATE_TEMPLATE_IDS,
  getWorkflowTemplate,
} from "@/modules/workflows/lib/templates";
import { NodeIcon } from "@/modules/nodes/components/node-icon";

type CanvasEmptyStateProps = {
  onOpenPicker: () => void;
  onAddNode: (nodeType: string) => void;
  onUseTemplate: (templateId: string) => void;
};

export function CanvasEmptyState({
  onOpenPicker,
  onAddNode,
  onUseTemplate,
}: CanvasEmptyStateProps) {
  const templates = EMPTY_STATE_TEMPLATE_IDS.map(getWorkflowTemplate);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="pointer-events-auto max-w-md rounded-2xl border bg-background/95 p-8 text-center shadow-sm backdrop-blur-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
          <HugeiconsIcon icon={WorkflowSquare02Icon} strokeWidth={2} className="size-6" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">
          Build your workflow
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with a trigger, or copy a pre-built path onto this canvas.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="sm" onClick={onOpenPicker}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Browse nodes
          </Button>
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              className="h-auto justify-start py-2 text-left whitespace-normal"
              onClick={() => onUseTemplate(template.id)}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <NodeIcon
                  nodeType={template.steps[0] ?? "manual-trigger"}
                  withBackground
                  className="size-6"
                  iconClassName="size-3"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{template.name}</span>
                  <span className="block text-[11px] font-normal text-muted-foreground">
                    {template.steps.length} nodes
                  </span>
                </span>
              </span>
            </Button>
          ))}
          <Button
            variant="ghost"
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
