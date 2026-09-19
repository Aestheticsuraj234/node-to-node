"use client";

import { useEffect, useState, useTransition } from "react";
import { PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { renameWorkflow } from "@/modules/workflows/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type RenameWorkflowDialogProps = {
  workflowId: string;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RenameWorkflowDialog({
  workflowId,
  currentName,
  open,
  onOpenChange,
}: RenameWorkflowDialogProps) {
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      await renameWorkflow(workflowId, name);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename workflow</DialogTitle>
            <DialogDescription>
              Choose a name that describes what this automation does.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="workflow-name">Name</Label>
            <Input
              id="workflow-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
