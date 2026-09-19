import prisma  from "@/lib/db";
import { getCurrentUser } from "@/modules/auth/actions";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workflowId } = await params;

  const execution = await prisma.execution.findFirst({
    where: { workflowId, workflow: { userId: user.id } },
    orderBy: { startedAt: "desc" },
    include: { steps: { orderBy: { startedAt: "asc" } } },
  });

  if (!execution) {
    return Response.json(null);
  }

  return Response.json({
    executionId: execution.id,
    executionStatus: execution.status,
    finishedAt: execution.finishedAt?.toISOString() ?? null,
    steps: execution.steps.map((step) => ({
      nodeId: step.nodeId,
      status:
        step.status === "RUNNING"
          ? "running"
          : step.status === "SUCCESS"
            ? "success"
            : step.status === "WAITING"
              ? "pending"
              : "error",
      error: step.error ?? undefined,
    })),
  });
}
