import { createWorkflowNode } from "@/modules/canvas/lib/create-node";
import type { WorkflowEdge, WorkflowNode } from "@/modules/canvas/lib/types";

export type WorkflowTemplateId =
  | "telegram-ai-blog-notion"
  | "telegram-openai-notion-reply"
  | "ai-telegram-bot"
  | "feedback-summarizer"
  | "github-notion-logger"
  | "webhook-ai-alerts"
  | "meeting-scheduler"
  | "priority-router"
  | "request-switchboard"
  | "manual-path";

export type WorkflowTemplateCategory =
  | "flagship"
  | "bot"
  | "ingest"
  | "alerts"
  | "calendar"
  | "routing"
  | "starter";

export type WorkflowTemplate = {
  id: WorkflowTemplateId;
  name: string;
  description: string;
  category: WorkflowTemplateCategory;
  featured?: boolean;
  steps: string[];
  build: () => { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
};

const CATEGORY_LABELS: Record<WorkflowTemplateCategory, string> = {
  flagship: "Flagship",
  bot: "Bot",
  ingest: "Ingest",
  alerts: "Alerts",
  calendar: "Calendar",
  routing: "Routing",
  starter: "Starter",
};

export function getTemplateCategoryLabel(category: WorkflowTemplateCategory) {
  return CATEGORY_LABELS[category];
}

function json(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function node(
  nodeType: string,
  position: { x: number; y: number },
  config?: Record<string, string>,
  label?: string,
): WorkflowNode {
  const created = createWorkflowNode(nodeType, position);
  if (label) created.data.label = label;
  if (config) created.data.config = { ...created.data.config, ...config };
  return created;
}

function connect(
  source: WorkflowNode,
  target: WorkflowNode,
  sourceHandle = "out",
  targetHandle = "in",
  label?: string,
): WorkflowEdge {
  const branch = sourceHandle !== "out" ? sourceHandle : undefined;
  const edgeLabel = label ?? branch;

  return {
    id: `e-${source.id}-${sourceHandle}-${target.id}-${targetHandle}`,
    source: source.id,
    target: target.id,
    sourceHandle,
    targetHandle,
    animated: true,
    type: "workflow",
    label: edgeLabel,
    data: branch ? { branch, label: edgeLabel } : undefined,
  };
}

function buildTelegramAiBlogNotion() {
  const trigger = node(
    "telegram-trigger",
    { x: 80, y: 180 },
    {
      testJson: json({
        message:
          "Write about why visual workflow builders help students learn LangGraph: triggers start a run, AI transforms the text, and Notion stores the result.",
        text: "Write about why visual workflow builders help students learn LangGraph: triggers start a run, AI transforms the text, and Notion stores the result.",
        chatId: "123456789",
        from: "priya",
      }),
    },
    "Telegram message",
  );

  const ai = node(
    "ai",
    { x: 400, y: 180 },
    {
      provider: "openai",
      prompt: `You are a technical blog writer for a student course on workflow automation.

Turn this Telegram note into a short blog post (2-3 paragraphs, markdown).

From: {{from}}
Note:
{{message}}`,
    },
    "Write blog post",
  );

  const fields = node(
    "set-fields",
    { x: 720, y: 180 },
    {
      fields: "title: {{message}}\ncontent: {{summary}}",
    },
    "Map title + body",
  );

  const notion = node(
    "notion-create-page",
    { x: 1040, y: 180 },
    {
      parentId: "",
      title: "{{title}}",
      content: "{{content}}",
    },
    "Save to Notion",
  );

  return {
    nodes: [trigger, ai, fields, notion],
    edges: [connect(trigger, ai), connect(ai, fields), connect(fields, notion)],
  };
}

function buildTelegramOpenaiNotionReply() {
  const trigger = node(
    "telegram-trigger",
    { x: 80, y: 180 },
    {
      testJson: json({
        message: "Write a short welcome note for students joining the Node to Node class.",
        text: "Write a short welcome note for students joining the Node to Node class.",
        chatId: "123456789",
        from: "priya",
      }),
    },
    "Telegram message",
  );

  const ai = node(
    "ai",
    { x: 400, y: 180 },
    {
      provider: "openai",
      prompt: `You are a writing assistant. Write exactly what the user asked for.
Do not add a preamble. Return only the finished piece.

User ({{from}}):
{{message}}`,
    },
    "OpenAI write",
  );

  const notion = node(
    "notion-create-page",
    { x: 720, y: 180 },
    {
      parentId: "",
      title: "{{message}}",
      content: "{{summary}}",
    },
    "Create Notion page",
  );

  const send = node(
    "telegram-send",
    { x: 1040, y: 180 },
    {
      chatId: "{{chatId}}",
      message: "Saved to Notion:\n{{url}}",
    },
    "Send Notion URL",
  );

  return {
    nodes: [trigger, ai, notion, send],
    edges: [
      connect(trigger, ai),
      connect(ai, notion),
      connect(notion, send),
    ],
  };
}

function buildAiTelegramBot() {
  const trigger = node(
    "telegram-trigger",
    { x: 80, y: 180 },
    {
      testJson: json({
        message: "In one sentence, what does an IF node do in a workflow?",
        text: "In one sentence, what does an IF node do in a workflow?",
        chatId: "123456789",
        from: "arjun",
      }),
    },
    "Student message",
  );

  const ai = node(
    "ai",
    { x: 400, y: 180 },
    {
      provider: "openai",
      prompt: `You are a friendly teaching assistant for a workflow automation class.
Reply in 2-4 short sentences. If you are unsure, say so.

Student ({{from}}):
{{message}}`,
    },
    "AI reply",
  );

  const send = node(
    "telegram-send",
    { x: 720, y: 180 },
    {
      chatId: "{{chatId}}",
      message: "{{summary}}",
    },
    "Send reply",
  );

  return {
    nodes: [trigger, ai, send],
    edges: [connect(trigger, ai), connect(ai, send)],
  };
}

function buildFeedbackSummarizer() {
  const trigger = node(
    "webhook-trigger",
    { x: 80, y: 180 },
    {
      testJson: json({
        source: "lesson-form",
        rating: "4",
        feedback:
          "The visual builder clicked for me, but I still get stuck wiring the IF node when both branches look the same.",
      }),
    },
    "Feedback webhook",
  );

  const ai = node(
    "ai",
    { x: 400, y: 180 },
    {
      provider: "openai",
      prompt: `Summarize this course feedback for the teaching team.
Include: overall sentiment, the main praise, and one concrete follow-up.

Source: {{source}}
Rating: {{rating}} / 5
Feedback:
{{feedback}}`,
    },
    "Summarize feedback",
  );

  const notion = node(
    "notion-create-page",
    { x: 720, y: 180 },
    {
      parentId: "",
      title: "Feedback ({{rating}}/5) from {{source}}",
      content: "{{summary}}",
    },
    "Log in Notion",
  );

  return {
    nodes: [trigger, ai, notion],
    edges: [connect(trigger, ai), connect(ai, notion)],
  };
}

function buildGithubNotionLogger() {
  const trigger = node(
    "github-trigger",
    { x: 80, y: 180 },
    {
      testJson: json({
        action: "opened",
        issue: {
          title: "Webhook retries drop the original payload",
          body: "When GitHub retries a delivery, the logger stores an empty body and we lose the issue text.",
          html_url: "https://github.com/acme/node-to-node/issues/42",
          number: 42,
        },
        repository: { full_name: "acme/node-to-node" },
        sender: { login: "octocat" },
      }),
    },
    "GitHub event",
  );

  const ai = node(
    "ai",
    { x: 400, y: 180 },
    {
      provider: "openai",
      prompt: `Write a short changelog note (4-6 sentences) for this GitHub event.

Repo: {{repository}}
Action: {{action}}
Author: {{sender}}
Title: {{title}}
Body:
{{body}}
URL: {{url}}`,
    },
    "Summarize event",
  );

  const notion = node(
    "notion-create-page",
    { x: 720, y: 180 },
    {
      parentId: "",
      title: "{{repository}} — {{title}}",
      content: "{{summary}}",
    },
    "Log in Notion",
  );

  return {
    nodes: [trigger, ai, notion],
    edges: [connect(trigger, ai), connect(ai, notion)],
  };
}

function buildWebhookAiAlerts() {
  const trigger = node(
    "webhook-trigger",
    { x: 80, y: 180 },
    {
      testJson: json({
        service: "checkout-api",
        severity: "high",
        error: "Payment provider timed out after 8s",
        chatId: "123456789",
      }),
    },
    "Incident webhook",
  );

  const ai = node(
    "ai",
    { x: 400, y: 180 },
    {
      provider: "openai",
      prompt: `Write a short on-call Telegram alert (max 4 lines).
Start with the severity in uppercase. Include the service and a next step.

Service: {{service}}
Severity: {{severity}}
Error: {{error}}`,
    },
    "Draft alert",
  );

  const send = node(
    "telegram-send",
    { x: 720, y: 180 },
    {
      chatId: "{{chatId}}",
      message: "{{summary}}",
    },
    "Ping Telegram",
  );

  return {
    nodes: [trigger, ai, send],
    edges: [connect(trigger, ai), connect(ai, send)],
  };
}

function buildMeetingScheduler() {
  const trigger = node(
    "webhook-trigger",
    { x: 80, y: 180 },
    {
      testJson: json({
        title: "Office hours: workflow templates",
        startTime: "2026-09-22T10:00:00Z",
        endTime: "2026-09-22T10:30:00Z",
        notes: "Walk through Telegram → AI → Notion and the IF router.",
        chatId: "123456789",
      }),
    },
    "Booking webhook",
  );

  const fields = node(
    "set-fields",
    { x: 400, y: 180 },
    {
      fields:
        "title: {{title}}\nstart: {{startTime}}\nend: {{endTime}}\nnotes: {{notes}}",
    },
    "Map event fields",
  );

  const calendar = node(
    "google-calendar-event",
    { x: 720, y: 180 },
    {
      title: "{{title}}",
      start: "{{start}}",
      end: "{{end}}",
    },
    "Create calendar event",
  );

  const send = node(
    "telegram-send",
    { x: 1040, y: 180 },
    {
      chatId: "{{chatId}}",
      message: "Booked: {{title}}\n{{start}} → {{end}}\n{{notes}}",
    },
    "Confirm on Telegram",
  );

  return {
    nodes: [trigger, fields, calendar, send],
    edges: [
      connect(trigger, fields),
      connect(fields, calendar),
      connect(calendar, send),
    ],
  };
}

function buildPriorityRouter() {
  const trigger = node(
    "webhook-trigger",
    { x: 80, y: 200 },
    {
      testJson: json({
        priority: "high",
        title: "Production webhook is returning 500",
        body: "Students cannot test GitHub triggers from the classroom network.",
        repository: "acme/classroom",
        chatId: "123456789",
      }),
    },
    "Ticket webhook",
  );

  const gate = node(
    "if",
    { x: 400, y: 200 },
    {
      field: "{{priority}}",
      value: "high",
    },
    "High priority?",
  );

  const issue = node(
    "github-create-issue",
    { x: 720, y: 80 },
    {
      repo: "{{repository}}",
      title: "{{title}}",
      body: "{{body}}",
    },
    "Open GitHub issue",
  );

  const send = node(
    "telegram-send",
    { x: 720, y: 320 },
    {
      chatId: "{{chatId}}",
      message: "Logged as low priority: {{title}}",
    },
    "Ack on Telegram",
  );

  return {
    nodes: [trigger, gate, issue, send],
    edges: [
      connect(trigger, gate),
      connect(gate, issue, "true", "in", "high"),
      connect(gate, send, "false", "in", "other"),
    ],
  };
}

function buildRequestSwitchboard() {
  const trigger = node(
    "webhook-trigger",
    { x: 80, y: 220 },
    {
      testJson: json({
        type: "bug",
        title: "Switch node ignores the default branch",
        details: "Only case A runs even when the value is unknown.",
        chatId: "123456789",
      }),
    },
    "Request webhook",
  );

  const router = node(
    "switch",
    { x: 400, y: 220 },
    {
      field: "{{type}}",
      cases: "bug: a\nidea: b",
    },
    "Route by type",
  );

  const issue = node(
    "github-create-issue",
    { x: 740, y: 40 },
    {
      repo: "your-org/your-repo",
      title: "{{title}}",
      body: "{{details}}",
    },
    "File a bug",
  );

  const notion = node(
    "notion-create-page",
    { x: 740, y: 220 },
    {
      parentId: "",
      title: "Idea: {{title}}",
      content: "{{details}}",
    },
    "Save idea",
  );

  const send = node(
    "telegram-send",
    { x: 740, y: 400 },
    {
      chatId: "{{chatId}}",
      message: "Got it ({{type}}): {{title}}",
    },
    "Default reply",
  );

  return {
    nodes: [trigger, router, issue, notion, send],
    edges: [
      connect(trigger, router),
      connect(router, issue, "a", "in", "bug"),
      connect(router, notion, "b", "in", "idea"),
      connect(router, send, "default", "in", "other"),
    ],
  };
}

function buildManualPath() {
  const trigger = node(
    "manual-trigger",
    { x: 80, y: 180 },
    {
      testJson: json({
        message:
          "We just launched Node to Node, a visual builder that connects triggers, AI, and actions into one workflow.",
      }),
    },
    "Manual trigger",
  );

  const ai = node(
    "ai",
    { x: 400, y: 180 },
    {
      provider: "openai",
      prompt:
        "Write a one-sentence product summary from this note:\n\n{{message}}",
    },
    "OpenAI",
  );

  const fields = node(
    "set-fields",
    { x: 720, y: 180 },
    {
      fields: "title: {{summary}}\nbody: {{response}}",
    },
    "Set fields",
  );

  const http = node(
    "http-request",
    { x: 1040, y: 180 },
    {
      method: "POST",
      url: "https://jsonplaceholder.typicode.com/posts",
      body: json({
        title: "{{title}}",
        body: "{{body}}",
        userId: 1,
      }),
    },
    "HTTP request",
  );

  return {
    nodes: [trigger, ai, fields, http],
    edges: [
      connect(trigger, ai),
      connect(ai, fields),
      connect(fields, http),
    ],
  };
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "telegram-ai-blog-notion",
    name: "Telegram → AI blog → Notion",
    description:
      "A Telegram note becomes a blog draft, then lands in Notion. The flagship path for class demos.",
    category: "flagship",
    featured: true,
    steps: ["telegram-trigger", "ai", "set-fields", "notion-create-page"],
    build: buildTelegramAiBlogNotion,
  },
  {
    id: "telegram-openai-notion-reply",
    name: "Telegram → OpenAI → Notion → reply",
    description:
      "Every Telegram message is written by OpenAI, saved as a Notion page, then the bot replies with that page URL.",
    category: "bot",
    steps: ["telegram-trigger", "ai", "notion-create-page", "telegram-send"],
    build: buildTelegramOpenaiNotionReply,
  },
  {
    id: "ai-telegram-bot",
    name: "AI Telegram bot",
    description:
      "Reply to students in Telegram with an AI teaching assistant. Click Run to test without a live bot.",
    category: "bot",
    steps: ["telegram-trigger", "ai", "telegram-send"],
    build: buildAiTelegramBot,
  },
  {
    id: "feedback-summarizer",
    name: "Feedback summarizer",
    description:
      "POST course feedback to the webhook, let AI summarize it, and file the note in Notion.",
    category: "ingest",
    steps: ["webhook-trigger", "ai", "notion-create-page"],
    build: buildFeedbackSummarizer,
  },
  {
    id: "github-notion-logger",
    name: "GitHub → Notion logger",
    description:
      "Capture issue and pull-request events from GitHub, summarize them, and keep a Notion changelog.",
    category: "ingest",
    steps: ["github-trigger", "ai", "notion-create-page"],
    build: buildGithubNotionLogger,
  },
  {
    id: "webhook-ai-alerts",
    name: "Webhook AI alerts",
    description:
      "Turn an incident JSON payload into a readable Telegram alert. Swap Test JSON to try different severities.",
    category: "alerts",
    steps: ["webhook-trigger", "ai", "telegram-send"],
    build: buildWebhookAiAlerts,
  },
  {
    id: "meeting-scheduler",
    name: "Meeting scheduler",
    description:
      "Book a Google Calendar event from a webhook, then send a Telegram confirmation.",
    category: "calendar",
    steps: [
      "webhook-trigger",
      "set-fields",
      "google-calendar-event",
      "telegram-send",
    ],
    build: buildMeetingScheduler,
  },
  {
    id: "priority-router",
    name: "Priority router",
    description:
      "IF node: high-priority tickets open a GitHub issue, everything else gets a Telegram ack.",
    category: "routing",
    steps: ["webhook-trigger", "if", "github-create-issue", "telegram-send"],
    build: buildPriorityRouter,
  },
  {
    id: "request-switchboard",
    name: "Request switchboard",
    description:
      "Switch node: bugs go to GitHub, ideas go to Notion, anything else gets a Telegram reply.",
    category: "routing",
    steps: [
      "webhook-trigger",
      "switch",
      "github-create-issue",
      "notion-create-page",
      "telegram-send",
    ],
    build: buildRequestSwitchboard,
  },
  {
    id: "manual-path",
    name: "Manual Path",
    description:
      "Starter path with no webhooks: Manual trigger → OpenAI → Set fields → HTTP request.",
    category: "starter",
    steps: ["manual-trigger", "ai", "set-fields", "http-request"],
    build: buildManualPath,
  },
];

export function getWorkflowTemplate(id: string) {
  const template = WORKFLOW_TEMPLATES.find((item) => item.id === id);
  if (!template) {
    throw new Error(`Unknown workflow template: ${id}`);
  }
  return template;
}

export function buildWorkflowTemplate(id: string) {
  return getWorkflowTemplate(id).build();
}

export const EMPTY_STATE_TEMPLATE_IDS: WorkflowTemplateId[] = [
  "telegram-ai-blog-notion",
  "telegram-openai-notion-reply",
  "ai-telegram-bot",
];
