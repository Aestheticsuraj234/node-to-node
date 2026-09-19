import { createHmac, timingSafeEqual } from "crypto";

export function verifyGithubSignature(rawBody: string, signature: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  if (!signature?.startsWith("sha256=")) return false;

  const digest = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const expected = Buffer.from(digest);
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export function parseGithubEvent(rawBody: string, eventName: string) {
  const payload = JSON.parse(rawBody || "{}") as Record<string, unknown>;
  return {
    ...payload,
    event: eventName || (payload.event as string | undefined) || "",
  };
}
