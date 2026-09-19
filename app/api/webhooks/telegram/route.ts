import {
  findActiveWorkflowsByTrigger,
  startActiveTriggerWorkflows,
} from "@/modules/webhooks/lib/dispatch";
import {
  getTelegramWebhookInfo,
  parseTelegramUpdate,
  ensureTelegramWebhook,
  verifyTelegramSecret,
} from "@/modules/webhooks/lib/telegram";
import { getWebhookBaseUrl, isPublicWebhookUrl } from "@/modules/webhooks/lib/public-url";

export async function GET() {
  const active = await findActiveWorkflowsByTrigger("telegram-trigger");
  const baseUrl = getWebhookBaseUrl();
  let webhookInfo: unknown = null;
  let registeredUrl: string | null = isPublicWebhookUrl(baseUrl)
    ? `${baseUrl}/api/webhooks/telegram`
    : null;
  let error: string | null = null;

  try {
    if (active.length > 0) {
      registeredUrl = await ensureTelegramWebhook();
    }
    webhookInfo = await getTelegramWebhookInfo();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return Response.json({
    ok: true,
    listening: active.length > 0,
    activeWorkflows: active.length,
    registeredUrl,
    webhookInfo,
    error,
  });
}

export async function POST(request: Request) {
  if (!verifyTelegramSecret(request)) {
    return Response.json({ error: "Invalid Telegram secret" }, { status: 401 });
  }

  const update = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const payload = parseTelegramUpdate(update);

  if (payload.ignore) {
    return Response.json({ ok: true, ignored: true }, { status: 200 });
  }

  const started = await startActiveTriggerWorkflows("telegram-trigger", "TELEGRAM", {
    message: payload.message,
    text: payload.text,
    chatId: payload.chatId,
    from: payload.from,
    raw: payload.raw,
  });

  return Response.json(
    { ok: true, started: started.executionIds.length, ...started },
    { status: 200 },
  );
}
