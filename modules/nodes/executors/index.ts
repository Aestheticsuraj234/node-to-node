import { runAI } from "@/modules/nodes/executors/ai";
import { runGithubCreateIssue } from "@/modules/nodes/executors/github-create-issue";
import { runGithubTrigger } from "@/modules/nodes/executors/github-trigger";
import { runGoogleCalendarEvent } from "@/modules/nodes/executors/google-calendar-event";
import { runHttpRequest } from "@/modules/nodes/executors/http-request";
import { runManualTrigger } from "@/modules/nodes/executors/manual-trigger";
import { runNotionCreatePage } from "@/modules/nodes/executors/notion-create-page";
import { runSetFields } from "@/modules/nodes/executors/set-fields";
import { runTelegramSend } from "@/modules/nodes/executors/telegram-send";
import { runTelegramTrigger } from "@/modules/nodes/executors/telegram-trigger";
import { runWebhookTrigger } from "@/modules/nodes/executors/webhook-trigger";

export type NodeRunContext = {
  userId: string;
};

const EXECUTORS: Record<
  string,
  (config: any, item: any, ctx?: NodeRunContext) => Promise<any>
> = {
  "manual-trigger": runManualTrigger,
  "webhook-trigger": runWebhookTrigger,
  "telegram-trigger": runTelegramTrigger,
  "github-trigger": runGithubTrigger,
  "set-fields": runSetFields,
  "http-request": runHttpRequest,
  ai: runAI,
  "telegram-send": runTelegramSend,
  "github-create-issue": runGithubCreateIssue,
  "notion-create-page": runNotionCreatePage,
  "google-calendar-event": runGoogleCalendarEvent,
};

export async function runNode(
  nodeType: string,
  config: any,
  item: any,
  ctx?: NodeRunContext,
) {
  const fn = EXECUTORS[nodeType];
  if (!fn) throw new Error(`No executor for node type: ${nodeType}`);
  return fn(config, item, ctx);
}
