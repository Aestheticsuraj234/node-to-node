"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

type CanvasToolbarProps = {
  onOpenPicker: () => void;
};

export function CanvasToolbar({ onOpenPicker }: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
      <Button size="sm" onClick={onOpenPicker}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
        Add node
      </Button>
    </div>
  );
}
