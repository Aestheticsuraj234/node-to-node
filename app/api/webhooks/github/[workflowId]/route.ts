import prisma  from "@/lib/db";
import { parseWorkflowGraph } from "@/modules/canvas/lib/parse-graph";
import { startWorkflowExecution } from "@/modules/engine/lib/start-execution";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const { workflowId } = await params;

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, active: true },
  });

  if (!workflow) {
    return Response.json({ error: "Workflow not found or inactive" }, { status: 404 });
  }

  const { nodes } = parseWorkflowGraph(workflow.nodes, workflow.edges);
  const hasGithubTrigger = nodes.some((n) => n.data.nodeType === "github-trigger");
  if (!hasGithubTrigger) {
    return Response.json({ error: "Workflow has no GitHub trigger" }, { status: 400 });
  }

  const payload = await request.json().catch(() => ({}));

  const executionId = await startWorkflowExecution(workflowId, "GITHUB", payload);

  return Response.json({ executionId }, { status: 202 });
}
