import prisma  from "@/lib/db";
import { parseWorkflowGraph } from "@/modules/canvas/lib/parse-graph";
import { startWorkflowExecution } from "@/modules/engine/lib/start-execution";

function parseTelegramUpdate(update: Record<string, unknown>) {
  const message =
    (update.message as Record<string, unknown> | undefined) ??
    (update.edited_message as Record<string, unknown> | undefined) ??
    (update.channel_post as Record<string, unknown> | undefined);

  if (!message) return { raw: update };

  const chat = message.chat as Record<string, unknown> | undefined;
  const from = message.from as Record<string, unknown> | undefined;
  const text = (message.text as string | undefined) ?? "";

  return {
    message: text,
    text,
    chatId: chat?.id != null ? String(chat.id) : "",
    from: (from?.username as string | undefined) ?? (from?.first_name as string | undefined) ?? "",
    raw: update,
  };
}

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
  const hasTelegramTrigger = nodes.some((n) => n.data.nodeType === "telegram-trigger");
  if (!hasTelegramTrigger) {
    return Response.json({ error: "Workflow has no Telegram trigger" }, { status: 400 });
  }

  const update = await request.json().catch(() => ({}));
  const payload = parseTelegramUpdate(update as Record<string, unknown>);

  const executionId = await startWorkflowExecution(workflowId, "TELEGRAM", payload);

  return Response.json({ executionId }, { status: 202 });
}
