"use client";

import { useState } from "react";
import { Cancel01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getConfigFields } from "@/modules/nodes/lib/index";
import type { WorkflowEdge, WorkflowNode } from "@/modules/canvas/lib/types";
import { FieldPicker } from "@/modules/canvas/components/field-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type NodeConfigPanelProps = {
  selectedNode: WorkflowNode | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode["data"]>) => void;
  onClose?: () => void;
};

export function NodeConfigPanel({
  selectedNode,
  nodes,
  edges,
  onUpdateNode,
  onClose,
}: NodeConfigPanelProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  if (!selectedNode) {
    return null;
  }

  const node = selectedNode;
  const fields = getConfigFields(node.data.nodeType);

  function updateConfig(key: string, value: string) {
    onUpdateNode(node.id, {
      config: { ...node.data.config, [key]: value },
    });
  }

  function insertField(token: string) {
    if (!focusedField) return;
    const current = node.data.config[focusedField] ?? "";
    updateConfig(focusedField, `${current}${token}`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} className="size-4 shrink-0" />
            <h3 className="truncate text-sm font-semibold">{node.data.label}</h3>
          </div>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {node.data.nodeType.replace(/-/g, " ")}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-label">Display name</Label>
            <Input
              id="node-label"
              value={node.data.label}
              onChange={(event) =>
                onUpdateNode(node.id, { label: event.target.value })
              }
            />
          </div>

          {fields.length > 0 && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Parameters
              </p>
              <FieldPicker
                selectedNodeId={node.id}
                nodes={nodes}
                edges={edges}
                onInsert={insertField}
              />
            </div>
          )}

          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === "select" ? (
                <NativeSelect
                  id={field.key}
                  className="w-full"
                  value={node.data.config[field.key] ?? field.options?.[0] ?? ""}
                  onChange={(event) => updateConfig(field.key, event.target.value)}
                  onFocus={() => setFocusedField(field.key)}
                >
                  {field.options?.map((option) => (
                    <NativeSelectOption key={option} value={option}>
                      {option}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              ) : field.type === "textarea" ? (
                <Textarea
                  id={field.key}
                  rows={4}
                  placeholder={field.placeholder}
                  value={node.data.config[field.key] ?? ""}
                  onChange={(event) => updateConfig(field.key, event.target.value)}
                  onFocus={() => setFocusedField(field.key)}
                  className="font-mono text-xs"
                />
              ) : (
                <Input
                  id={field.key}
                  placeholder={field.placeholder}
                  value={node.data.config[field.key] ?? ""}
                  onChange={(event) => updateConfig(field.key, event.target.value)}
                  onFocus={() => setFocusedField(field.key)}
                  className="font-mono text-xs"
                />
              )}
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No extra settings for this node yet.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Use {"{{field}}"} syntax to map data from upstream nodes.
          </p>
        </div>
      </div>
    </div>
  );
}
