"use client";
import { useState, useTransition } from "react";
import { PlayIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { triggerWorkflow } from "@/modules/workflows/actions";
import { Button } from "@/components/ui/button";

type RunWorkflowButtonProps = {
    workflowId: string;
    onRunStarted?: (executionId: string) => void;
  };
  
  export function RunWorkflowButton({
    workflowId,
    onRunStarted,
  }: RunWorkflowButtonProps) {
    const [pending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);
  
    function handleRun() {
      setMessage(null);
      startTransition(async () => {
        try {
          const executionId = await triggerWorkflow(workflowId);
          onRunStarted?.(executionId);
          setMessage(`Run started (${executionId.slice(0, 8)}…)`);
        } catch (err: any) {
          setMessage(err?.message ?? "Run failed");
        }
      });
    }
  
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" disabled={pending} onClick={handleRun}>
          <HugeiconsIcon icon={PlayIcon} strokeWidth={2} data-icon="inline-start" />
          {pending ? "Running…" : "Run"}
        </Button>
        {message && (
          <span className="max-w-[180px] truncate text-xs text-muted-foreground">
            {message}
          </span>
        )}
      </div>
    );
  }