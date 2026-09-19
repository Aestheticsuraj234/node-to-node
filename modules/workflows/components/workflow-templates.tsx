"use client";

import { useState, useTransition } from "react";
import { createWorkflow } from "@/modules/workflows/actions";
import { WorkflowTemplatePicker } from "@/modules/workflows/components/workflow-template-picker";

export function WorkflowTemplates() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(templateId?: string) {
    if (!templateId) return;
    setPendingId(templateId);
    startTransition(() => createWorkflow(templateId));
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Templates</h3>
        <p className="text-xs text-muted-foreground">
          Ready-made paths for verifying executors. Manual Path is the first.
        </p>
      </div>
      <WorkflowTemplatePicker
        showBlank={false}
        pendingId={isPending ? pendingId : null}
        onSelect={handleCreate}
      />
    </section>
  );
}
