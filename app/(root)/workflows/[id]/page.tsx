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
import { WorkflowBuilder } from "@/modules/canvas/components/workflow-builder";

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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
    <header className="shrink-0 border-b px-4 py-2.5">
      <WorkflowEditorHeader workflow={workflow} />
    </header>
    <div className="min-h-0 flex-1 overflow-hidden">
      <WorkflowBuilder
        workflowId={workflow.id}
        initialNodes={workflow.nodes}
        initialEdges={workflow.edges}
      />
    </div>
  </div>
  );
}
