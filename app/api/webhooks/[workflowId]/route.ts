import  prisma  from "@/lib/db";
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
  const webhookNode = nodes.find((n) => n.data.nodeType === "webhook-trigger");
  const secret = webhookNode?.data.config.secret;

  if (secret && request.headers.get("x-webhook-secret") !== secret) {
    return Response.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const executionId = await startWorkflowExecution(workflowId, "WEBHOOK", body);

  return Response.json({ executionId }, { status: 202 });
}
