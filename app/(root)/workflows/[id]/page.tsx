import { notFound } from "next/navigation";
import { WorkflowSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getWorkflow } from "@/modules/workflows/actions";
import { WorkflowEditorHeader } from "@/modules/workflows/components/workflow-editor-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function WorkflowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = await getWorkflow(id);

  if (!workflow) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <WorkflowEditorHeader workflow={workflow} />

      <Empty className="min-h-[480px] flex-1 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={WorkflowSquare02Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Canvas builder coming soon</EmptyTitle>
          <EmptyDescription>
            Phase 3 adds the React Flow editor here — drag nodes, connect
            edges, and configure each step.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  );
}
