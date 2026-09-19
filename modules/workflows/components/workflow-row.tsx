"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight01Icon,
  Delete02Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { deleteWorkflow, toggleActive } from "@/modules/workflows/actions";
import { RenameWorkflowDialog } from "@/modules/workflows/components/rename-workflow-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";

type WorkflowRowProps = {
  workflow: {
    id: string;
    name: string;
    active: boolean;
    updatedAt: Date;
    executions: {
      status: "RUNNING" | "SUCCESS" | "ERROR" | "WAITING";
      startedAt: Date;
    }[];
  };
};

const statusLabels = {
  RUNNING: "Running",
  SUCCESS: "Success",
  ERROR: "Error",
  WAITING: "Waiting",
} as const;

const statusVariants = {
  RUNNING: "secondary",
  SUCCESS: "outline",
  ERROR: "destructive",
  WAITING: "secondary",
} as const;

export function WorkflowRow({ workflow }: WorkflowRowProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const lastRun = workflow.executions[0];

  function handleToggleActive(checked: boolean) {
    startTransition(async () => {
      await toggleActive(workflow.id, checked);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteWorkflow(workflow.id);
    });
  }

  return (
    <>
      <TableRow className="group">
        <TableCell>
          <Link
            href={`/workflows/${workflow.id}`}
            className="flex items-center gap-2 font-medium hover:underline"
          >
            <span className="truncate">{workflow.name}</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </Link>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Switch
              checked={workflow.active}
              disabled={isPending}
              onCheckedChange={handleToggleActive}
            />
            <span className="text-xs text-muted-foreground">
              {workflow.active ? "Active" : "Inactive"}
            </span>
          </div>
        </TableCell>
        <TableCell>
          {lastRun ? (
            <Badge variant={statusVariants[lastRun.status]}>
              {statusLabels[lastRun.status]}
            </Badge>
          ) : (
            <span className="text-muted-foreground">Never run</span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatDistanceToNow(workflow.updatedAt, { addSuffix: true })}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={`/workflows/${workflow.id}`} />}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                  <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
                  Rename
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <RenameWorkflowDialog
        workflowId={workflow.id}
        currentName={workflow.name}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{workflow.name}&rdquo; and all
              of its execution history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? <Spinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
