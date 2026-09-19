"use client";

import { Add01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NodeIcon } from "@/modules/nodes/components/node-icon";
import {
  WORKFLOW_TEMPLATES,
  type WorkflowTemplate,
} from "@/modules/workflows/lib/templates";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type WorkflowTemplatePickerProps = {
  onSelect: (templateId?: string) => void;
  pendingId?: string | null;
  showBlank?: boolean;
};

function TemplateRow({
  title,
  description,
  steps,
  pending,
  onSelect,
}: {
  title: string;
  description: string;
  steps?: string[];
  pending: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
        "hover:bg-muted/60 disabled:opacity-70",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          {steps && (
            <Badge variant="secondary" className="font-normal">
              Template
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        {steps && steps.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5">
            {steps.map((step, index) => (
              <span key={`${step}-${index}`} className="flex items-center gap-1.5">
                <NodeIcon
                  nodeType={step}
                  config={step === "ai" ? { provider: "openai" } : undefined}
                  withBackground
                  className="size-7"
                  iconClassName="size-3.5"
                />
                {index < steps.length - 1 && (
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className="size-3 text-muted-foreground"
                  />
                )}
              </span>
            ))}
          </div>
        )}
      </div>
      {pending ? (
        <Spinner className="mt-1 size-4" />
      ) : (
        <HugeiconsIcon
          icon={Add01Icon}
          strokeWidth={2}
          className="mt-1 size-4 shrink-0 text-muted-foreground"
        />
      )}
    </button>
  );
}

export function WorkflowTemplatePicker({
  onSelect,
  pendingId = null,
  showBlank = true,
}: WorkflowTemplatePickerProps) {
  return (
    <div className="grid gap-2">
      {showBlank && (
        <TemplateRow
          title="Blank workflow"
          description="Empty canvas — add your own trigger and steps"
          pending={pendingId === "blank"}
          onSelect={() => onSelect()}
        />
      )}
      {WORKFLOW_TEMPLATES.map((template: WorkflowTemplate) => (
        <TemplateRow
          key={template.id}
          title={template.name}
          description={template.description}
          steps={template.steps}
          pending={pendingId === template.id}
          onSelect={() => onSelect(template.id)}
        />
      ))}
    </div>
  );
}
