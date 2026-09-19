import {
  findActiveWorkflowsByTrigger,
  startActiveTriggerWorkflows,
} from "@/modules/webhooks/lib/dispatch";
import {
  parseGithubEvent,
  verifyGithubSignature,
} from "@/modules/webhooks/lib/github";
import { getWebhookBaseUrl } from "@/modules/webhooks/lib/public-url";

export async function GET() {
  const active = await findActiveWorkflowsByTrigger("github-trigger");
  const baseUrl = getWebhookBaseUrl();
  return Response.json({
    ok: true,
    listening: active.length > 0,
    activeWorkflows: active.length,
    registeredUrl: baseUrl ? `${baseUrl}/api/webhooks/github` : null,
    hint: "Point the GitHub repo webhook at this URL (application/json). Activate a GitHub trigger workflow to listen.",
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyGithubSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid GitHub signature" }, { status: 401 });
  }

  const eventName = request.headers.get("x-github-event") ?? "";
  if (eventName === "ping") {
    return Response.json({ ok: true, ping: true }, { status: 200 });
  }

  const payload = parseGithubEvent(rawBody, eventName);
  const started = await startActiveTriggerWorkflows("github-trigger", "GITHUB", payload);

  return Response.json(
    { ok: true, event: eventName, started: started.executionIds.length, ...started },
    { status: 202 },
  );
}
