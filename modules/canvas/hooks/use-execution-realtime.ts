"use client";

import { useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRealtime } from "inngest/react";
import { mergeExecutionOverlay } from "@/modules/canvas/lib/execution-overlay";
import type { NodeExecutionOverlay } from "@/modules/canvas/lib/types";
import type { NodeStatusPayload } from "@/modules/inngest/realtime/publish-node-status";
import { executionChannel } from "@/modules/inngest/realtime/channels";

export function useExecutionRealtime(
  executionId: string | null,
  setOverlay: Dispatch<SetStateAction<NodeExecutionOverlay>>,
) {
  const channel = useMemo(
    () => (executionId ? executionChannel({ executionId }) : null),
    [executionId],
  );

  const realtime = useRealtime({
    enabled: !!channel,
    channel: channel ?? executionChannel({ executionId: "idle" }),
    topics: ["node-status"] as const,
    token: async () => {
      const res = await fetch(`/api/realtime-token?executionId=${executionId}`);
      if (!res.ok) throw new Error("Could not connect to live run");
      return res.json();
    },
    key: executionId ?? undefined,
  });

  useEffect(() => {
    if (!executionId) return;

    const patch: NodeExecutionOverlay = {};
    for (const message of realtime.messages.delta) {
      if (message.topic !== "node-status") continue;

      const { nodeId, status, error } = message.data as NodeStatusPayload;
      patch[nodeId] = { status, errorMessage: error };
    }

    if (Object.keys(patch).length === 0) return;

    setOverlay((current) => mergeExecutionOverlay(current, patch, "latest"));
  }, [executionId, realtime.messages.delta, setOverlay]);

  return realtime.connectionStatus;
}
