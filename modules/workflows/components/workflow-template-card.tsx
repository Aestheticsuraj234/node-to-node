"use client";

import { Add01Icon, ArrowRight01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NodeIcon } from "@/modules/nodes/components/node-icon";
import {
  getTemplateCategoryLabel,
  type WorkflowTemplate,
} from "@/modules/workflows/lib/templates";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type WorkflowTemplateCardProps = {
  template: WorkflowTemplate;
  pending?: boolean;
  featured?: boolean;
  onSelect: () => void;
};

export function WorkflowTemplateCard({
  template,
  pending = false,
  featured = false,
  onSelect,
}: WorkflowTemplateCardProps) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onSelect}
      className={cn(
        "flex h-full w-full flex-col items-start rounded-2xl border px-4 py-4 text-left transition-colors",
        "hover:bg-muted/60 disabled:opacity-70",
        featured && "bg-muted/30 sm:flex-row sm:items-start sm:gap-6 sm:px-5 sm:py-5",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-medium", featured ? "text-base" : "text-sm")}>
            {template.name}
          </p>
          {featured ? (
            <Badge variant="default" className="font-normal">
              <HugeiconsIcon icon={StarIcon} strokeWidth={2} data-icon="inline-start" />
              Flagship
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-normal">
              {getTemplateCategoryLabel(template.category)}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
        {template.steps.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {template.steps.map((step, index) => (
              <span key={`${template.id}-${step}-${index}`} className="flex items-center gap-1.5">
                <NodeIcon
                  nodeType={step}
                  config={step === "ai" ? { provider: "openai" } : undefined}
                  withBackground
                  className={featured ? "size-8" : "size-7"}
                  iconClassName={featured ? "size-4" : "size-3.5"}
                />
                {index < template.steps.length - 1 && (
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
      <div className={cn("flex items-center gap-1.5", featured ? "mt-4 sm:mt-1" : "mt-3")}>
        {pending ? (
          <Spinner className="size-4" />
        ) : (
          <>
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground">Use template</span>
          </>
        )}
      </div>
    </button>
  );
}
