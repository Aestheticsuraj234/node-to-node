/** Plain node list — add a node here, done. No registry class. */

export type NodeCategory = "trigger" | "transform" | "control" | "ai" | "action";

export type ConfigField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

export type NodeType = {
  type: string;
  label: string;
  description?: string;
  category: NodeCategory;
  inputs: { id: string; label?: string }[];
  outputs: { id: string; label?: string }[];
  isTrigger?: boolean;
  config: ConfigField[];
  sampleFields: string[];
};

export const NODE_TYPES: NodeType[] = [
  {
    type: "manual-trigger",
    label: "Manual Trigger",
    description: "Run the workflow manually with test data",
    category: "trigger",
    isTrigger: true,
    inputs: [],
    outputs: [{ id: "out" }],
    config: [
      { key: "testJson", label: "Test JSON", type: "textarea", placeholder: '{"message": "hello"}' },
    ],
    sampleFields: ["message", "text", "payload"],
  },
  {
    type: "webhook-trigger",
    label: "Webhook Trigger",
    description: "Start when an HTTP request hits your webhook URL",
    category: "trigger",
    isTrigger: true,
    inputs: [],
    outputs: [{ id: "out", label: "Payload" }],
    config: [
      { key: "secret", label: "Secret header (optional)", type: "text", placeholder: "my-secret" },
      {
        key: "testJson",
        label: "Test JSON",
        type: "textarea",
        placeholder: '{"message": "hello"}',
      },
    ],
    sampleFields: ["body", "headers", "query"],
  },
  {
    type: "telegram-trigger",
    label: "Telegram Trigger",
    description: "Start when your Telegram bot receives a message",
    category: "trigger",
    isTrigger: true,
    inputs: [],
    outputs: [{ id: "out", label: "Message" }],
    config: [
      {
        key: "testJson",
        label: "Test JSON",
        type: "textarea",
        placeholder: '{"message": "hello", "chatId": "123", "from": "student"}',
      },
    ],
    sampleFields: ["message", "chatId", "from", "text"],
  },
  {
    type: "github-trigger",
    label: "GitHub Trigger",
    description: "Start on push, PR, or issue events from GitHub",
    category: "trigger",
    isTrigger: true,
    inputs: [],
    outputs: [{ id: "out", label: "Event" }],
    config: [
      {
        key: "testJson",
        label: "Test JSON",
        type: "textarea",
        placeholder: '{"action": "opened", "title": "Bug report"}',
      },
    ],
    sampleFields: ["action", "event", "repository", "title", "body", "url", "sender"],
  },
  {
    type: "set-fields",
    label: "Set Fields",
    description: "Map and rename fields between steps",
    category: "transform",
    inputs: [{ id: "in" }],
    outputs: [{ id: "out" }],
    config: [
      { key: "fields", label: "Field mappings", type: "textarea", placeholder: "summary: {{text}}" },
    ],
    sampleFields: ["*"],
  },
  {
    type: "if",
    label: "IF",
    description: "Route to true or false branch based on a condition",
    category: "control",
    inputs: [{ id: "in" }],
    outputs: [
      { id: "true", label: "True" },
      { id: "false", label: "False" },
    ],
    config: [
      { key: "field", label: "Field to check", type: "text", placeholder: "{{status}}" },
      { key: "value", label: "Equals", type: "text", placeholder: "success" },
    ],
    sampleFields: ["result"],
  },
  {
    type: "switch",
    label: "Switch",
    description: "Route to multiple branches by matching a value",
    category: "control",
    inputs: [{ id: "in" }],
    outputs: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "default", label: "Default" },
    ],
    config: [
      { key: "field", label: "Field to match", type: "text", placeholder: "{{type}}" },
      { key: "cases", label: "Cases (one per line: value: branch)", type: "textarea", placeholder: "order: a\nrefund: b" },
    ],
    sampleFields: ["result"],
  },
  {
    type: "ai",
    label: "AI",
    description: "OpenAI, Claude, or Gemini — pick a provider in config",
    category: "ai",
    inputs: [{ id: "in" }],
    outputs: [{ id: "out" }],
    config: [
      { key: "provider", label: "Provider", type: "select", options: ["openai", "claude", "gemini"] },
      { key: "prompt", label: "Prompt", type: "textarea", placeholder: "Summarize: {{text}}" },
    ],
    sampleFields: ["summary", "content", "response"],
  },
  {
    type: "http-request",
    label: "HTTP Request",
    description: "Call any REST API",
    category: "action",
    inputs: [{ id: "in" }],
    outputs: [{ id: "out" }],
    config: [
      { key: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
      { key: "url", label: "URL", type: "text", placeholder: "https://jsonplaceholder.typicode.com/users/1" },
      { key: "body", label: "Body", type: "textarea", placeholder: '{"key": "{{value}}"}' },
    ],
    sampleFields: ["data", "status", "headers"],
  },
  {
    type: "telegram-send",
    label: "Telegram Send",
    description: "Send a message via your Telegram bot",
    category: "action",
    inputs: [{ id: "in" }],
    outputs: [{ id: "out" }],
    config: [
      { key: "chatId", label: "Chat ID", type: "text", placeholder: "{{chatId}}" },
      { key: "message", label: "Message", type: "textarea", placeholder: "{{summary}}" },
    ],
    sampleFields: ["ok", "messageId"],
  },
  {
    type: "github-create-issue",
    label: "GitHub Create Issue",
    description: "Create an issue in a GitHub repository",
    category: "action",
    inputs: [{ id: "in" }],
    outputs: [{ id: "out" }],
    config: [
      { key: "repo", label: "Repository", type: "text", placeholder: "owner/repo" },
      { key: "title", label: "Title", type: "text", placeholder: "{{title}}" },
      { key: "body", label: "Body", type: "textarea", placeholder: "{{summary}}" },
    ],
    sampleFields: ["number", "url", "title"],
  },
  {
    type: "notion-create-page",
    label: "Notion Create Page",
    description: "Create a page in your Notion workspace",
    category: "action",
    inputs: [{ id: "in" }],
    outputs: [{ id: "out" }],
    config: [
      { key: "parentId", label: "Parent page ID", type: "text" },
      { key: "title", label: "Title", type: "text", placeholder: "{{title}}" },
      { key: "content", label: "Content", type: "textarea", placeholder: "{{summary}}" },
    ],
    sampleFields: ["id", "url"],
  },
  {
    type: "google-calendar-event",
    label: "Google Calendar Event",
    description: "Create an event on the connected Google Calendar",
    category: "action",
    inputs: [{ id: "in" }],
    outputs: [{ id: "out" }],
    config: [
      { key: "title", label: "Title", type: "text", placeholder: "{{title}}" },
      { key: "start", label: "Start", type: "text", placeholder: "{{startTime}}" },
      { key: "end", label: "End", type: "text", placeholder: "{{endTime}}" },
    ],
    sampleFields: ["id", "htmlLink"],
  },
];

export function getNode(type: string) {
  return NODE_TYPES.find((node) => node.type === type);
}

export function getConfigFields(type: string) {
  return getNode(type)?.config ?? [];
}

export function getSampleFields(type: string) {
  return getNode(type)?.sampleFields ?? ["data"];
}

/** Back-compat aliases — use NODE_TYPES / getNode / NodeType instead */
export const NODE_REGISTRY = NODE_TYPES;
export type NodeTypeDefinition = NodeType;
export const getNodeDefinition = getNode;
