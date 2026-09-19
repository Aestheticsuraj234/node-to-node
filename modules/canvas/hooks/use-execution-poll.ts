"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { mergeExecutionOverlay } from "@/modules/canvas/lib/execution-overlay";
import type {
  NodeExecutionOverlay,
  NodeExecutionStatus,
} from "@/modules/canvas/lib/types";

const SHOW_MS = 120_000;
const LIVE_POLL_MS = 800;
const REALTIME_BACKUP_MS = 2_500;

type SnapshotStep = {
  nodeId: string;
  status: NodeExecutionStatus;
  error?: string;
};

type ExecutionSnapshot = {
  executionId: string;
  executionStatus: "RUNNING" | "SUCCESS" | "ERROR" | "WAITING";
  finishedAt: string | null;
  steps: SnapshotStep[];
};

type UseExecutionPollOptions = {
  realtimeOpen: boolean;
  onRunActiveChange: (active: boolean) => void;
};

/** Poll DB for execution steps — fallback when realtime is down or lagging */
export function useExecutionPoll(
  workflowId: string,
  setOverlay: Dispatch<SetStateAction<NodeExecutionOverlay>>,
  setActiveExecutionId: Dispatch<SetStateAction<string | null>>,
  { realtimeOpen, onRunActiveChange }: UseExecutionPollOptions,
) {
  const seenExecutionId = useRef<string | null>(null);
  const runActiveRef = useRef(false);

  const noteStarted = useCallback(
    (executionId: string) => {
      seenExecutionId.current = executionId;
      runActiveRef.current = true;
      onRunActiveChange(true);
      setActiveExecutionId(executionId);
      setOverlay({});
    },
    [onRunActiveChange, setActiveExecutionId, setOverlay],
  );

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(
          `/api/workflow/${workflowId}/execution-snapshot`,
          { cache: "no-store" },
        );
        if (!res.ok || cancelled) return;

        const snapshot = (await res.json()) as ExecutionSnapshot | null;
        if (!snapshot) {
          if (seenExecutionId.current) {
            seenExecutionId.current = null;
            runActiveRef.current = false;
            onRunActiveChange(false);
            setActiveExecutionId(null);
            setOverlay({});
          }
          return;
        }

        const finishedAgo = snapshot.finishedAt
          ? Date.now() - new Date(snapshot.finishedAt).getTime()
          : 0;
        const visible =
          snapshot.executionStatus === "RUNNING" || finishedAgo < SHOW_MS;

        if (!visible) {
          if (seenExecutionId.current) {
            seenExecutionId.current = null;
            runActiveRef.current = false;
            onRunActiveChange(false);
            setActiveExecutionId(null);
            setOverlay({});
          }
          return;
        }

        const isCurrentRun = snapshot.executionId === seenExecutionId.current;
        if (!isCurrentRun && runActiveRef.current) {
          // Ignore a stale in-flight snapshot while this canvas run is live
          return;
        }

        const isNewRun = !isCurrentRun;
        if (isNewRun) {
          seenExecutionId.current = snapshot.executionId;
          setOverlay({});
        }

        const running = snapshot.executionStatus === "RUNNING";
        runActiveRef.current = running;
        onRunActiveChange(running);
        setActiveExecutionId(snapshot.executionId);

        const patch: NodeExecutionOverlay = {};
        for (const step of snapshot.steps) {
          patch[step.nodeId] = {
            status: step.status,
            errorMessage: step.error,
          };
        }

        setOverlay((current) =>
          isNewRun ? patch : mergeExecutionOverlay(current, patch),
        );
      } catch {
        // ignore transient poll failures
      }
    }

    poll();
    const intervalMs = realtimeOpen ? REALTIME_BACKUP_MS : LIVE_POLL_MS;
    const interval = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    workflowId,
    realtimeOpen,
    setOverlay,
    setActiveExecutionId,
    onRunActiveChange,
  ]);

  return noteStarted;
}
