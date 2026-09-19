import prisma from "@/lib/db";
import { parseWorkflowGraph } from "@/modules/canvas/lib/parse-graph";
import { startWorkflowExecution } from "@/modules/engine/lib/start-execution";
import {
  parseTelegramUpdate,
  verifyTelegramSecret,
} from "@/modules/webhooks/lib/telegram";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const { workflowId } = await params;

  if (!verifyTelegramSecret(request)) {
    return Response.json({ error: "Invalid Telegram secret" }, { status: 401 });
  }

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, active: true },
  });

  if (!workflow) {
    return Response.json({ error: "Workflow not found or inactive" }, { status: 404 });
  }

  const { nodes } = parseWorkflowGraph(workflow.nodes, workflow.edges);
  const hasTelegramTrigger = nodes.some((n) => n.data.nodeType === "telegram-trigger");
  if (!hasTelegramTrigger) {
    return Response.json({ error: "Workflow has no Telegram trigger" }, { status: 400 });
  }

  const update = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseTelegramUpdate(update);
  if (parsed.ignore) {
    return Response.json({ ok: true, ignored: true }, { status: 200 });
  }

  const executionId = await startWorkflowExecution(workflowId, "TELEGRAM", {
    message: parsed.message,
    text: parsed.text,
    chatId: parsed.chatId,
    from: parsed.from,
    raw: parsed.raw,
  });

  return Response.json({ executionId }, { status: 200 });
}
