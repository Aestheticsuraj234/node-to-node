"use client";

import { useState, useTransition } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createWorkflow } from "@/modules/workflows/actions";
import { WorkflowTemplatePicker } from "@/modules/workflows/components/workflow-template-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type NewWorkflowButtonProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function NewWorkflowButton({
  className,
  size = "default",
  variant = "default",
}: NewWorkflowButtonProps) {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(templateId?: string) {
    setPendingId(templateId ?? "blank");
    startTransition(() => createWorkflow(templateId));
  }

  return (
    <>
      <Button
        className={cn(className)}
        size={size}
        variant={variant}
        disabled={isPending}
        onClick={() => setOpen(true)}
      >
        {isPending ? (
          <Spinner />
        ) : (
          <HugeiconsIcon
            icon={Add01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
        )}
        New workflow
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New workflow</DialogTitle>
            <DialogDescription>
              Start from a blank canvas or use the Manual Path template to
              verify trigger → AI → transform → HTTP.
            </DialogDescription>
          </DialogHeader>
          <WorkflowTemplatePicker
            pendingId={isPending ? pendingId : null}
            onSelect={handleCreate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
