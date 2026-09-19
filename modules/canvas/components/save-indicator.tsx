"use client";

import { Loading03Icon, CheckmarkCircle02Icon, Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { SaveStatus } from "@/modules/canvas/hooks/use-autosave";
import { cn } from "@/lib/utils";

type SaveIndicatorProps = {
  status: SaveStatus;
  className?: string;
};

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      {status === "saving" && (
        <>
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className="size-3.5 animate-spin"
          />
          Saving…
        </>
      )}
      {status === "saved" && (
        <>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
          Saved
        </>
      )}
      {status === "error" && (
        <>
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-3.5 text-destructive" />
          Save failed
        </>
      )}
    </div>
  );
}
