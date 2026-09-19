"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { WorkflowTemplateCard } from "@/modules/workflows/components/workflow-template-card";
import { WORKFLOW_TEMPLATES } from "@/modules/workflows/lib/templates";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type WorkflowTemplatePickerProps = {
  onSelect: (templateId?: string) => void;
  pendingId?: string | null;
  showBlank?: boolean;
};

export function WorkflowTemplatePicker({
  onSelect,
  pendingId = null,
  showBlank = true,
}: WorkflowTemplatePickerProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {showBlank && (
        <button
          type="button"
          disabled={pendingId === "blank"}
          onClick={() => onSelect()}
          className={cn(
            "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors sm:col-span-2",
            "hover:bg-muted/60 disabled:opacity-70",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Blank workflow</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Empty canvas — add your own trigger and steps
            </p>
          </div>
          {pendingId === "blank" ? (
            <Spinner className="mt-1 size-4" />
          ) : (
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              className="mt-1 size-4 shrink-0 text-muted-foreground"
            />
          )}
        </button>
      )}
      {WORKFLOW_TEMPLATES.map((template) => (
        <div
          key={template.id}
          className={template.featured ? "sm:col-span-2" : undefined}
        >
          <WorkflowTemplateCard
            template={template}
            featured={template.featured}
            pending={pendingId === template.id}
            onSelect={() => onSelect(template.id)}
          />
        </div>
      ))}
    </div>
  );
}
