import { END, START, StateGraph } from "@langchain/langgraph";
import type { WorkflowEdge, WorkflowNode } from "@/modules/canvas/lib/types";
import { executeCanvasNode } from "@/modules/engine/lib/execute-node"

import { WorkflowState } from "@/modules/engine/lib/state"

const TRIGGER_TYPES = [
    "manual-trigger",
    "webhook-trigger",
    "telegram-trigger",
    "github-trigger",
  ];
  
const CONDITIONAL_TYPES = new Set(["if", "switch"]);

function findTrigger(nodes: WorkflowNode[]) {
    return nodes.find((node) => TRIGGER_TYPES.includes(node.data.nodeType));
  }

export function compileWorkflow(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    executionId: string,
    userId: string,
  ) {
    const graph = new StateGraph(WorkflowState);
  
    for (const node of nodes) {
      graph.addNode(node.id, async (state) =>
        executeCanvasNode(state, node, executionId, userId),
      );
    }
  
    const trigger = findTrigger(nodes);
    if (!trigger) throw new Error("Workflow needs a trigger node");
  
    graph.addEdge(START, trigger.id);
  
    const conditionalSources = new Set<string>();
  
    for (const node of nodes) {
      if (!CONDITIONAL_TYPES.has(node.data.nodeType)) continue;
  
      const outgoing = edges.filter((edge) => edge.source === node.id);
      const pathMap: Record<string, string> = {};
  
      for (const edge of outgoing) {
        const branch = edge.sourceHandle ?? edge.data?.branch ?? "default";
        pathMap[branch] = edge.target;
      }
  
      graph.addConditionalEdges(node.id, (state) => state.branch || "false", pathMap);
      conditionalSources.add(node.id);
    }
  
    for (const edge of edges) {
      if (conditionalSources.has(edge.source)) continue;
      graph.addEdge(edge.source, edge.target);
    }
  
    for (const node of nodes) {
      const hasOutgoing = edges.some((edge) => edge.source === node.id);
      if (!hasOutgoing) graph.addEdge(node.id, END);
    }
  
    return graph.compile();
  }