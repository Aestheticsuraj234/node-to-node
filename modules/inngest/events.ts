import { eventType, staticSchema } from "inngest";

/** Fired when a workflow should run in the background */
export const workflowTriggered = eventType("workflow/triggered", {
  schema: staticSchema<{
    workflowId: string;
    executionId: string;
    trigger: "MANUAL" | "WEBHOOK" | "TELEGRAM" | "GITHUB" | "SCHEDULE";
    input?: Record<string, unknown>;
  }>(),
});
