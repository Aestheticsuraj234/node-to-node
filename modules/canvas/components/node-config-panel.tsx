"use client";

import { useEffect, useState } from "react";
import {
  Cancel01Icon,
  Copy01Icon,
  Link01Icon,
  Settings02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getGoogleCalendarConnection } from "@/modules/auth/actions";
import { EnableGoogleCalendarButton } from "@/modules/auth/components/enable-google-calendar";
import { getConfigFields } from "@/modules/nodes/lib/index";
import type { WorkflowEdge, WorkflowNode } from "@/modules/canvas/lib/types";
import { FieldPicker } from "@/modules/canvas/components/field-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

const WEBHOOK_META: Record<
  string,
  {
    path: (workflowId: string) => string;
    hint: string;
    statusPath?: string;
  }
> = {
  "webhook-trigger": {
    path: (id) => `/api/webhooks/${id}`,
    hint: "Turn the workflow Active, then POST JSON here. Click Run to replay Test JSON.",
  },
  "telegram-trigger": {
    path: () => `/api/webhooks/telegram`,
    statusPath: "/api/webhooks/telegram",
    hint: "One bot URL for every active Telegram workflow. Activate this workflow to register the bot, then send it a message.",
  },
  "github-trigger": {
    path: () => `/api/webhooks/github`,
    statusPath: "/api/webhooks/github",
    hint: "In GitHub: Settings → Webhooks → Add webhook. Content type application/json. Send me everything. Activate this workflow to listen.",
  },
};

type NodeConfigPanelProps = {
  workflowId: string;
  selectedNode: WorkflowNode | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode["data"]>) => void;
  onClose?: () => void;
};

function TriggerWebhookHint({
  nodeType,
  workflowId,
}: {
  nodeType: string;
  workflowId: string;
}) {
  const [copied, setCopied] = useState(false);
  const [listening, setListening] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const meta = WEBHOOK_META[nodeType];

  useEffect(() => {
    if (!meta?.statusPath) return;
    fetch(meta.statusPath)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.registeredUrl === "string" && data.registeredUrl) {
          setPublicUrl(data.registeredUrl);
        }
        if (data.error) {
          setListening(String(data.error));
          return;
        }
        setListening(
          data.listening
            ? `Listening · ${data.activeWorkflows} active workflow${data.activeWorkflows === 1 ? "" : "s"}`
            : "Idle — turn this workflow Active to listen",
        );
      })
      .catch(() => setListening(null));
  }, [meta?.statusPath]);

  if (!meta) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = publicUrl ?? `${origin}${meta.path(workflowId)}`;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-2 rounded-xl border bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={Link01Icon} strokeWidth={2} className="size-3.5" />
        <p className="text-xs font-medium">Live webhook</p>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{meta.hint}</p>
      {listening && (
        <p className="text-[11px] font-medium text-muted-foreground">{listening}</p>
      )}
      <div className="flex items-center gap-2">
        <Input readOnly value={url} className="font-mono text-[11px]" />
        <Button type="button" size="icon-sm" variant="outline" onClick={copyUrl}>
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            strokeWidth={2}
          />
          <span className="sr-only">Copy webhook URL</span>
        </Button>
      </div>
    </div>
  );
}

function GoogleCalendarHint({ nodeType }: { nodeType: string }) {
  const [status, setStatus] = useState<{
    linked: boolean;
    enabled: boolean;
  } | null>(null);

  useEffect(() => {
    if (nodeType !== "google-calendar-event") return;
    getGoogleCalendarConnection().then(setStatus);
  }, [nodeType]);

  if (nodeType !== "google-calendar-event") return null;

  return (
    <div className="space-y-2 rounded-xl border bg-muted/40 p-3">
      <p className="text-xs font-medium">Google account</p>
      <EnableGoogleCalendarButton status={status} />
    </div>
  );
}

export function NodeConfigPanel({
  workflowId,
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

          <TriggerWebhookHint
            nodeType={node.data.nodeType}
            workflowId={workflowId}
          />

          <GoogleCalendarHint nodeType={node.data.nodeType} />

          <p className="text-xs text-muted-foreground">
            Use {"{{field}}"} syntax to map data from upstream nodes.
          </p>
        </div>
      </div>
    </div>
  );
}
