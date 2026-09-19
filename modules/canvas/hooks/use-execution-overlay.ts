"use client";

import { useCallback, useState } from "react";
import { useExecutionPoll } from "@/modules/canvas/hooks/use-execution-poll";
import { useExecutionRealtime } from "@/modules/canvas/hooks/use-execution-realtime";
import type { NodeExecutionOverlay } from "@/modules/canvas/lib/types";

/** Live node statuses: Inngest realtime first, DB snapshot as fallback */
export function useExecutionOverlay(workflowId: string) {
  const [overlay, setOverlay] = useState<NodeExecutionOverlay>({});
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [runActive, setRunActive] = useState(false);

  const connectionStatus = useExecutionRealtime(activeExecutionId, setOverlay);
  const noteStarted = useExecutionPoll(
    workflowId,
    setOverlay,
    setActiveExecutionId,
    {
      realtimeOpen: connectionStatus === "open",
      onRunActiveChange: setRunActive,
    },
  );

  const startExecution = useCallback(
    (executionId: string) => {
      noteStarted(executionId);
    },
    [noteStarted],
  );

  return {
    overlay,
    runActive,
    activeExecutionId,
    startExecution,
    connectionStatus,
  };
}
