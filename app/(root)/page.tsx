import { requireAuth } from "@/modules/auth/actions";
import { NewWorkflowButton } from "@/modules/workflows/components/new-workflow-button";
import { WorkflowList } from "@/modules/workflows/components/workflow-list";
import { WorkflowTemplates } from "@/modules/workflows/components/workflow-templates";

export default async function Home() {
  await requireAuth();

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Workflows</h2>
          <p className="text-sm text-muted-foreground">
            Build automations from scratch or start from a template.
          </p>
        </div>
        <NewWorkflowButton className="shrink-0" />
      </div>
      <WorkflowTemplates />
      <WorkflowList />
    </main>
  );
}
