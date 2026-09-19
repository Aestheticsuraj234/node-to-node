"use client";

import { useMemo, useState } from "react";
import { Add01Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NODE_TYPES,
  type NodeCategory,
  type NodeType,
} from "@/modules/nodes/lib/index";
import { NodeIcon } from "@/modules/nodes/components/node-icon";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const categoryLabels: Record<NodeCategory, string> = {
  trigger: "Triggers",
  transform: "Transform",
  control: "Control flow",
  ai: "AI",
  action: "Actions",
};

const categoryOrder: NodeCategory[] = [
  "trigger",
  "transform",
  "control",
  "ai",
  "action",
];

type NodePickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (nodeType: string) => void;
};

function NodePickerItem({
  node,
  onSelect,
}: {
  node: NodeType;
  onSelect: (type: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node.type)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left",
        "hover:border-border hover:bg-muted/60",
      )}
    >
      <NodeIcon
        nodeType={node.type}
        config={node.type === "ai" ? { provider: "openai" } : undefined}
        withBackground
        backgroundClassName="ring-1 ring-border/50"
        className="size-10"
        iconClassName="size-5"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{node.label}</span>
        <span className="block text-xs text-muted-foreground">
          {node.description ?? categoryLabels[node.category]}
        </span>
      </span>
      <HugeiconsIcon
        icon={Add01Icon}
        strokeWidth={2}
        className="size-4 shrink-0 text-muted-foreground"
      />
    </button>
  );
}

export function NodePickerSheet({
  open,
  onOpenChange,
  onAddNode,
}: NodePickerSheetProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NODE_TYPES;
    return NODE_TYPES.filter(
      (node) =>
        node.label.toLowerCase().includes(q) ||
        node.type.toLowerCase().includes(q) ||
        node.category.toLowerCase().includes(q) ||
        node.description?.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = categoryOrder
    .map((category) => ({
      category,
      label: categoryLabels[category],
      nodes: filtered.filter((node) => node.category === category),
    }))
    .filter((group) => group.nodes.length > 0);

  function handleSelect(nodeType: string) {
    onAddNode(nodeType);
    onOpenChange(false);
    setQuery("");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full max-w-md gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>Add a node</SheetTitle>
          <SheetDescription>
            Triggers, transforms, control flow, AI, and actions.
          </SheetDescription>
          <div className="relative pt-2">
            <HugeiconsIcon
              icon={SearchIcon}
              strokeWidth={2}
              className="absolute top-5.5 left-3 size-4 text-muted-foreground"
            />
            <Input
              placeholder="Search nodes…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {grouped.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No nodes match your search.
            </p>
          ) : (
            <div className="space-y-5">
              {grouped.map((group) => (
                <div key={group.category}>
                  <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.nodes.map((node) => (
                      <NodePickerItem
                        key={node.type}
                        node={node}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
