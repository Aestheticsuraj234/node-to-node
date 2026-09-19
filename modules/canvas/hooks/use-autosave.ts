"use client";

import { useEffect, useRef, useState } from "react";
import type { Edge } from "@xyflow/react";
import { saveWorkflowGraph } from "@/modules/workflows/actions";
import type { WorkflowNode } from "@/modules/canvas/lib/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave(
  workflowId: string,
  nodes: WorkflowNode[],
  edges: Edge[],
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setStatus("saving");

    const timeout = setTimeout(async () => {
      try {
        await saveWorkflowGraph(workflowId, nodes, edges);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [workflowId, nodes, edges]);

  return status;
}
