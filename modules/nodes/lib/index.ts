export type NodeCategory = "trigger" | "transform" | "ai" | "action";

export type NodeTypeDefinition = {
  type: string;
  label: string;
  category: NodeCategory;
};

export const NODE_TYPES: NodeTypeDefinition[] = [
  { type: "manual-trigger", label: "Manual Trigger", category: "trigger" },
  { type: "webhook-trigger", label: "Webhook Trigger", category: "trigger" },
  { type: "telegram-trigger", label: "Telegram Trigger", category: "trigger" },
  { type: "github-trigger", label: "GitHub Trigger", category: "trigger" },
  { type: "set-fields", label: "Set Fields", category: "transform" },
  { type: "http-request", label: "HTTP Request", category: "action" },
  { type: "ai", label: "AI", category: "ai" },
  { type: "telegram-send", label: "Telegram Send", category: "action" },
  { type: "github-create-issue", label: "GitHub Create Issue", category: "action" },
  { type: "notion-create-page", label: "Notion Create Page", category: "action" },
  { type: "google-calendar-event", label: "Google Calendar Event", category: "action" },
];
