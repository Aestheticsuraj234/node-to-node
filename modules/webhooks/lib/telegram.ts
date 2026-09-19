import {
  getWebhookBaseUrl,
  isPublicWebhookUrl,
} from "@/modules/webhooks/lib/public-url";

const TELEGRAM_SECRET_HEADER = "x-telegram-bot-api-secret-token";

export function parseTelegramUpdate(update: Record<string, unknown>) {
  const callback = update.callback_query as Record<string, unknown> | undefined;
  const message =
    (update.message as Record<string, unknown> | undefined) ??
    (update.edited_message as Record<string, unknown> | undefined) ??
    (update.channel_post as Record<string, unknown> | undefined) ??
    (callback?.message as Record<string, unknown> | undefined);

  const from =
    (message?.from as Record<string, unknown> | undefined) ??
    (callback?.from as Record<string, unknown> | undefined);
  const chat = message?.chat as Record<string, unknown> | undefined;

  if (from?.is_bot === true) {
    return { ignore: true as const, raw: update };
  }

  const text =
    (message?.text as string | undefined) ??
    (message?.caption as string | undefined) ??
    (callback?.data as string | undefined) ??
    "";

  if (!message && !callback) {
    return { ignore: true as const, raw: update };
  }

  return {
    ignore: false as const,
    message: text,
    text,
    chatId: chat?.id != null ? String(chat.id) : "",
    from:
      (from?.username as string | undefined) ??
      (from?.first_name as string | undefined) ??
      "",
    raw: update,
  };
}

export function verifyTelegramSecret(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  return request.headers.get(TELEGRAM_SECRET_HEADER) === secret;
}

export async function registerTelegramWebhook() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN missing in .env");
  }

  const baseUrl = getWebhookBaseUrl();
  if (!isPublicWebhookUrl(baseUrl)) {
    throw new Error(
      "Telegram needs a public HTTPS URL. Set WEBHOOK_BASE_URL or BETTER_AUTH_URL to your ngrok URL.",
    );
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `${baseUrl}/api/webhooks/telegram`,
      secret_token: secret || undefined,
      allowed_updates: [
        "message",
        "edited_message",
        "channel_post",
        "callback_query",
      ],
      drop_pending_updates: false,
    }),
  });

  const data = (await res.json()) as { ok?: boolean; description?: string };
  if (!data.ok) {
    throw new Error(data.description ?? "Telegram setWebhook failed");
  }

  return `${baseUrl}/api/webhooks/telegram`;
}

export async function getTelegramWebhookInfo() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return null;

  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  return res.json() as Promise<{
    ok?: boolean;
    result?: { url?: string; last_error_message?: string };
  }>;
}

export async function ensureTelegramWebhook() {
  const baseUrl = getWebhookBaseUrl();
  const expected = isPublicWebhookUrl(baseUrl)
    ? `${baseUrl}/api/webhooks/telegram`
    : "";
  const info = await getTelegramWebhookInfo();
  if (expected && info?.result?.url === expected) {
    return expected;
  }
  return registerTelegramWebhook();
}
