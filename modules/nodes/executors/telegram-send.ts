import { interpolate } from "@/modules/engine/lib/template";

/** Send a Telegram message via bot token in .env */
export async function runTelegramSend(config: any, item: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN missing in .env");

  const message = interpolate(config.message ?? "", item);
  // Reply to whoever messaged the bot — chatId flows from Telegram Trigger automatically
  let chatId = interpolate(config.chatId ?? "", item);
  if (!chatId && item?.chatId != null) chatId = String(item.chatId);
  if (!chatId) {
    throw new Error(
      "No chat ID — leave Chat ID blank after a Telegram Trigger, or set a fixed ID for alerts",
    );
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.description ?? "Telegram send failed");

  return { ...item, ok: data.ok, messageId: data.result?.message_id };
}
