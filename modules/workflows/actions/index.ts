"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import  prisma  from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";
import { inngest } from "@/modules/inngest/client";
import { workflowTriggered } from "@/modules/inngest/events";
import { getWorkflowTemplate } from "@/modules/workflows/lib/templates";
import { parseWorkflowGraph } from "@/modules/canvas/lib/parse-graph";
import { ensureTelegramWebhook } from "@/modules/webhooks/lib/telegram";

export async function getWorkflows() {
  const user = await requireAuth();

  return prisma.workflow.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      executions: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { status: true, startedAt: true },
      },
    },
  });
}

export async function getWorkflow(id: string) {
  const user = await requireAuth();

  return prisma.workflow.findFirst({
    where: { id, userId: user.id },
  });
}

export async function createWorkflow(templateId?: string) {
  const user = await requireAuth();
  const template = templateId ? getWorkflowTemplate(templateId) : undefined;
  const graph = template?.build();

  const workflow = await prisma.workflow.create({
    data: {
      name: template?.name ?? "Untitled workflow",
      userId: user.id,
      nodes: (graph?.nodes ?? []) as any,
      edges: (graph?.edges ?? []) as any,
    },
  });

  revalidatePath("/");
  redirect(`/workflows/${workflow.id}`);
}

export async function renameWorkflow(id: string, name: string) {
  const user = await requireAuth();

  await prisma.workflow.updateMany({
    where: { id, userId: user.id },
    data: { name: name.trim() || "Untitled workflow" },
  });

  revalidatePath("/");
  revalidatePath(`/workflows/${id}`);
}

export async function deleteWorkflow(id: string) {
  const user = await requireAuth();

  await prisma.workflow.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
  redirect("/");
}

export async function toggleActive(id: string, active: boolean) {
  const user = await requireAuth();

  await prisma.workflow.updateMany({
    where: { id, userId: user.id },
    data: { active },
  });

  revalidatePath("/");
  revalidatePath(`/workflows/${id}`);

  if (!active) return { ok: true as const };

  const workflow = await prisma.workflow.findFirst({
    where: { id, userId: user.id },
    select: { nodes: true },
  });
  const { nodes } = parseWorkflowGraph(workflow?.nodes, []);
  const listensToTelegram = nodes.some(
    (node) => node.data.nodeType === "telegram-trigger",
  );

  if (!listensToTelegram) return { ok: true as const };

  try {
    await ensureTelegramWebhook();
    return { ok: true as const };
  } catch (err) {
    return {
      ok: true as const,
      warning:
        err instanceof Error
          ? err.message
          : "Telegram webhook could not be registered",
    };
  }
}


export async function saveWorkflowGraph(
  id: string,
  nodes: unknown,
  edges: unknown,
) {
  const user = await requireAuth();

  await prisma.workflow.updateMany({
    where: { id, userId: user.id },
    data: { nodes: nodes as any, edges: edges as any },
  });
}


export async function triggerWorkflow(workflowId: string) {
  const user = await requireAuth();

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId: user.id },
  });

  if (!workflow) throw new Error("Workflow not found");

    const execution = await prisma.execution.create({
      data: {
        workflowId,
        trigger: "MANUAL",
        status: "RUNNING",
      },
    });

  await inngest.send(
    workflowTriggered.create({
      workflowId,
      executionId: execution.id,
      trigger: "MANUAL",
    }),
  );

  return execution.id;
}