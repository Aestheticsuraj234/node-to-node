"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import type { WorkflowEdge, WorkflowNode } from "@/modules/canvas/lib/types";
import { parseWorkflowGraph } from "@/modules/canvas/lib/parse-graph";
import { createWorkflowNode } from "@/modules/canvas/lib/create-node";
import {
  applyEdgeExecutionOverlay,
  applyNodeExecutionOverlay,
} from "@/modules/canvas/lib/execution-overlay";
import { Canvas } from "@/modules/canvas/components/canvas";
import { CanvasEmptyState } from "@/modules/canvas/components/canvas-empty-state";
import { CanvasToolbar } from "@/modules/canvas/components/canvas-toolbar";
import { CollapseSidebarOnMount } from "@/modules/canvas/components/collapse-sidebar";
import { NodeConfigPanel } from "@/modules/canvas/components/node-config-panel";
import { NodePickerSheet } from "@/modules/canvas/components/node-picker-sheet";
import { SaveIndicator } from "@/modules/canvas/components/save-indicator";
import { useAutosave } from "@/modules/canvas/hooks/use-autosave";
import { useExecutionOverlay } from "@/modules/canvas/hooks/use-execution-overlay";
import { buildWorkflowTemplate } from "@/modules/workflows/lib/templates";

type WorkflowBuilderProps = {
  workflowId: string;
  initialNodes: unknown;
  initialEdges: unknown;
};

function WorkflowBuilderInner({
  workflowId,
  initialNodes,
  initialEdges,
}: WorkflowBuilderProps) {
  const parsed = parseWorkflowGraph(initialNodes, initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(parsed.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(parsed.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { overlay, runActive, startExecution } = useExecutionOverlay(workflowId);

  const saveStatus = useAutosave(workflowId, nodes, edges);
  const displayNodes = useMemo(
    () => applyNodeExecutionOverlay(nodes, overlay, runActive),
    [nodes, overlay, runActive],
  );
  const displayEdges = useMemo(
    () => applyEdgeExecutionOverlay(edges, overlay, runActive),
    [edges, overlay, runActive],
  );

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;

  const addNode = useCallback(
    (nodeType: string) => {
      const offset = nodes.length * 48;
      const position = screenToFlowPosition({
        x: window.innerWidth / 2 + offset - (selectedNode ? 160 : 0),
        y: window.innerHeight / 2 + offset - 80,
      });

      const newNode = createWorkflowNode(nodeType, position);
      setNodes((current) => current.concat(newNode));
      setSelectedNodeId(newNode.id);
    },
    [nodes.length, screenToFlowPosition, selectedNode, setNodes],
  );

  const applyTemplate = useCallback(
    (templateId: string) => {
      const graph = buildWorkflowTemplate(templateId);
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setSelectedNodeId(graph.nodes[0]?.id ?? null);
      requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 200 });
      });
    },
    [fitView, setEdges, setNodes],
  );

  const onUpdateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNode["data"]>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node,
        ),
      );
    },
    [setNodes],
  );

  return (
    <>
      <CollapseSidebarOnMount />

      <div className="flex h-full min-h-0 w-full overflow-hidden">
        {/* Canvas — full width until config opens */}
        <div className="relative min-w-0 flex-1">
          <CanvasToolbar
            workflowId={workflowId}
            onOpenPicker={() => setPickerOpen(true)}
            onRunStarted={startExecution}
          />

          <SaveIndicator
            status={saveStatus}
            className="absolute top-4 right-4 z-20 rounded-full border bg-background/90 px-2.5 py-1 shadow-sm backdrop-blur-sm"
          />

          {nodes.length === 0 && (
            <CanvasEmptyState
              onOpenPicker={() => setPickerOpen(true)}
              onAddNode={addNode}
              onUseTemplate={applyTemplate}
            />
          )}

          <Canvas
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            setNodes={setNodes}
            setEdges={setEdges}
            onSelectionChange={setSelectedNodeId}
          />
        </div>

        {/* Right config panel — n8n style, only when a node is selected */}
        {selectedNode && (
          <aside className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-l bg-background">
            <NodeConfigPanel
              workflowId={workflowId}
              selectedNode={selectedNode}
              nodes={nodes}
              edges={edges}
              onUpdateNode={onUpdateNode}
              onClose={() => setSelectedNodeId(null)}
            />
          </aside>
        )}
      </div>

      <NodePickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onAddNode={addNode}
      />
    </>
  );
}

export function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner {...props} />
    </ReactFlowProvider>
  );
}
