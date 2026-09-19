import { createWorkflowNode } from "@/modules/canvas/lib/create-node";
import type { WorkflowEdge, WorkflowNode } from "@/modules/canvas/lib/types";

export type WorkflowTemplateId = "manual-path";

export type WorkflowTemplate = {
  id: WorkflowTemplateId;
  name: string;
  description: string;
  steps: string[];
  build: () => { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
};

function connect(source: WorkflowNode, target: WorkflowNode): WorkflowEdge {
  return {
    id: `e-${source.id}-out-${target.id}-in`,
    source: source.id,
    target: target.id,
    sourceHandle: "out",
    targetHandle: "in",
    animated: true,
    type: "workflow",
  };
}

function buildManualPath() {
  const trigger = createWorkflowNode("manual-trigger", { x: 80, y: 160 });
  const ai = createWorkflowNode("ai", { x: 380, y: 160 });
  const setFields = createWorkflowNode("set-fields", { x: 680, y: 160 });
  const http = createWorkflowNode("http-request", { x: 980, y: 160 });

  trigger.data.config = {
    testJson: JSON.stringify(
      {
        message:
          "We just launched Node to Node, a visual builder that connects triggers, AI, and actions into one workflow.",
      },
      null,
      2,
    ),
  };

  ai.data.label = "OpenAI";
  ai.data.config = {
    provider: "openai",
    prompt:
      "Write a one-sentence product summary from this note:\n\n{{message}}",
  };

  setFields.data.config = {
    fields: "title: {{summary}}\nbody: {{response}}",
  };

  http.data.config = {
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    body: JSON.stringify(
      {
        title: "{{title}}",
        body: "{{body}}",
        userId: 1,
      },
      null,
      2,
    ),
  };

  const nodes = [trigger, ai, setFields, http];
  const edges = [
    connect(trigger, ai),
    connect(ai, setFields),
    connect(setFields, http),
  ];

  return { nodes, edges };
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "manual-path",
    name: "Manual Path",
    description:
      "Manual trigger with test JSON → OpenAI → Set fields → HTTP request",
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
