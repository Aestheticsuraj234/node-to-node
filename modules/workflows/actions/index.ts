"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import  prisma  from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";

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

export async function createWorkflow(name = "Untitled workflow") {
  const user = await requireAuth();

  const workflow = await prisma.workflow.create({
    data: { name, userId: user.id },
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
}
