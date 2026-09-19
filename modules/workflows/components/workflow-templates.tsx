"use client";

import { useState, useTransition } from "react";
import { createWorkflow } from "@/modules/workflows/actions";
import { WorkflowTemplateCard } from "@/modules/workflows/components/workflow-template-card";
import { WORKFLOW_TEMPLATES } from "@/modules/workflows/lib/templates";

export function WorkflowTemplates() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(templateId: string) {
    setPendingId(templateId);
    startTransition(() => createWorkflow(templateId));
  }

  const featured = WORKFLOW_TEMPLATES.find((template) => template.featured);
  const rest = WORKFLOW_TEMPLATES.filter((template) => !template.featured);

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Templates</h3>
        <p className="text-xs text-muted-foreground">
          One click copies every node and edge into a new workflow. Click Run to
          replay the sample payload, or turn the workflow Active and POST to its
          webhook URL.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {featured && (
          <div className="sm:col-span-2 xl:col-span-3">
            <WorkflowTemplateCard
              template={featured}
              featured
              pending={isPending && pendingId === featured.id}
              onSelect={() => handleCreate(featured.id)}
            />
          </div>
        )}
        {rest.map((template) => (
          <WorkflowTemplateCard
            key={template.id}
            template={template}
            pending={isPending && pendingId === template.id}
            onSelect={() => handleCreate(template.id)}
          />
        ))}
      </div>
    </section>
  );
}
