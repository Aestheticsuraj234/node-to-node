"use client";

import { BracketsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getSampleFields } from "@/modules/nodes/lib/index";
import type { WorkflowEdge, WorkflowNode } from "@/modules/canvas/lib/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type FieldPickerProps = {
  selectedNodeId: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onInsert: (field: string) => void;
};

function getUpstreamFields(
  selectedNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): string[] {
  const incoming = edges.filter((edge) => edge.target === selectedNodeId);
  const fields = new Set<string>();

  for (const edge of incoming) {
    const source = nodes.find((node) => node.id === edge.source);
    if (!source) continue;

    const outputs = getSampleFields(source.data.nodeType);
    for (const field of outputs) {
      fields.add(field === "*" ? "field" : field);
    }
  }

  if (fields.size === 0) {
    return ["message", "text", "summary", "data"];
  }

  return Array.from(fields);
}

export function FieldPicker({
  selectedNodeId,
  nodes,
  edges,
  onInsert,
}: FieldPickerProps) {
  const fields =
    selectedNodeId != null
      ? getUpstreamFields(selectedNodeId, nodes, edges)
      : ["message", "text", "summary"];

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <HugeiconsIcon icon={BracketsIcon} strokeWidth={2} />
            Insert field
          </Button>
        }
      />
      <PopoverContent align="start" className="w-52 p-2">
        <p className="mb-2 px-1 text-xs text-muted-foreground">
          Upstream fields
        </p>
        <div className="flex flex-wrap gap-1">
          {fields.map((field) => (
            <Button
              key={field}
              type="button"
              variant="secondary"
              size="xs"
              className="font-mono"
              onClick={() => onInsert(`{{${field}}}`)}
            >
              {`{{${field}}}`}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
