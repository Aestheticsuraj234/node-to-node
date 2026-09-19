import type { Edge, Node } from "@xyflow/react";

export type NodeExecutionStatus = "idle" | "running" | "success" | "error";

export type WorkflowNodeData = {
  label: string;
  nodeType: string;
  config: Record<string, string>;
  status?: NodeExecutionStatus;
};

export type WorkflowNode = Node<WorkflowNodeData>;

/** Edge data includes branch id for LangGraph conditional routing */
export type WorkflowEdgeData = {
  branch?: string;
  label?: string;
};

export type WorkflowEdge = Edge<WorkflowEdgeData>;

export type ConfigField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

export const WORKFLOW_NODE_TYPE = "workflow";
