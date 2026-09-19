import  prisma  from "@/lib/db";
import { parseWorkflowGraph } from "@/modules/canvas/lib/parse-graph";
import { compileWorkflow } from "@/modules/engine/lib/compile-workflow";

/** Compile canvas → LangGraph, invoke, update Execution row */
export async function runWorkflow(executionId: string) {
  const execution = await prisma.execution.findUniqueOrThrow({
    where: { id: executionId },
    include: { workflow: true },
  });

  const { nodes, edges } = parseWorkflowGraph(
    execution.workflow.nodes,
    execution.workflow.edges,
  );

  const app = compileWorkflow(
    nodes,
    edges,
    executionId,
    execution.workflow.userId,
  );

  try {
    const result = await app.invoke({
      item: (execution.data as any) ?? {},
      branch: "",
      nodeResults: {},
    });

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        data: result.item as any,
      },
    });

    return result.item;
  } catch (err) {
    await prisma.execution.update({
      where: { id: executionId },
      data: { status: "ERROR", finishedAt: new Date() },
    });
    throw err;
  }
}
