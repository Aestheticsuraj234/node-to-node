import prisma from "@/lib/db";
import { parseWorkflowGraph } from "@/modules/canvas/lib/parse-graph";
import { startWorkflowExecution } from "@/modules/engine/lib/start-execution";
import {
  parseGithubEvent,
  verifyGithubSignature,
} from "@/modules/webhooks/lib/github";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const { workflowId } = await params;
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyGithubSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid GitHub signature" }, { status: 401 });
  }

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

  const eventName = request.headers.get("x-github-event") ?? "";
  if (eventName === "ping") {
    return Response.json({ ok: true, ping: true }, { status: 200 });
  }

  const payload = parseGithubEvent(rawBody, eventName);
  const executionId = await startWorkflowExecution(workflowId, "GITHUB", payload);

  return Response.json({ executionId }, { status: 202 });
}
