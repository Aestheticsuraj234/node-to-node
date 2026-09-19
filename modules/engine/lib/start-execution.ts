import prisma  from "@/lib/db";
import type { TriggerType } from "@/lib/generated/prisma/client";
import { inngest } from "@/modules/inngest/client";
import { workflowTriggered } from "@/modules/inngest/events";

/** Create Execution row + fire Inngest event */
export async function startWorkflowExecution(
  workflowId: string,
  trigger: TriggerType,
  input?: Record<string, unknown>,
) {
  const execution = await prisma.execution.create({
    data: {
      workflowId,
      trigger,
      status: "RUNNING",
      data: (input ?? undefined) as any,
    },
  });

  await inngest.send(
    workflowTriggered.create({
      workflowId,
      executionId: execution.id,
      trigger,
      input,
    }),
  );

  return execution.id;
}
