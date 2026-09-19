import { WorkflowSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getWorkflows } from "@/modules/workflows/actions";
import { NewWorkflowButton } from "@/modules/workflows/components/new-workflow-button";
import { WorkflowRow } from "@/modules/workflows/components/workflow-row";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function WorkflowList() {
  const workflows = await getWorkflows();

  if (workflows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={WorkflowSquare01Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>No workflows yet</EmptyTitle>
          <EmptyDescription>
            Create your first automation to connect triggers, AI, and actions
            on a visual canvas.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewWorkflowButton />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last run</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((workflow) => (
            <WorkflowRow key={workflow.id} workflow={workflow} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
