"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toggleActive } from "@/modules/workflows/actions";
import { RenameWorkflowDialog } from "@/modules/workflows/components/rename-workflow-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type WorkflowEditorHeaderProps = {
  workflow: {
    id: string;
    name: string;
    active: boolean;
  };
};

export function WorkflowEditorHeader({ workflow }: WorkflowEditorHeaderProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [warning, setWarning] = useState<string | null>(null);

  function handleToggleActive(checked: boolean) {
    setWarning(null);
    startTransition(async () => {
      const result = await toggleActive(workflow.id, checked);
      if (result?.warning) setWarning(result.warning);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" render={<Link href="/" />}>
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight">
                {workflow.name}
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setRenameOpen(true)}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Visual canvas editor · Phase 3
            </p>
            {warning && (
              <p className="mt-1 text-xs text-destructive">{warning}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={workflow.active ? "default" : "secondary"}>
            {workflow.active ? "Active" : "Inactive"}
          </Badge>
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
            <Switch
              checked={workflow.active}
              disabled={isPending}
              onCheckedChange={handleToggleActive}
            />
            <span className="text-sm">Active</span>
          </div>
        </div>
      </div>

      <RenameWorkflowDialog
        workflowId={workflow.id}
        currentName={workflow.name}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
    </>
  );
}
