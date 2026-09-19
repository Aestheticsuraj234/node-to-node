"use client";

import { useTransition } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createWorkflow } from "@/modules/workflows/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type NewWorkflowButtonProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function NewWorkflowButton({
  className,
  size = "default",
  variant = "default",
}: NewWorkflowButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className={cn(className)}
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={() => startTransition(() => createWorkflow())}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
      )}
      New workflow
    </Button>
  );
}
