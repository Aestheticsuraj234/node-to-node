import { getClientSubscriptionToken } from "inngest/react";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/modules/auth/actions";
import { inngest } from "@/modules/inngest/client";
import { executionChannel } from "@/modules/inngest/realtime/channels";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const executionId = new URL(request.url).searchParams.get("executionId");
  if (!executionId) {
    return Response.json({ error: "executionId required" }, { status: 400 });
  }

  const execution = await prisma.execution.findFirst({
    where: {
      id: executionId,
      workflow: { userId: user.id },
    },
  });

  if (!execution) {
    return Response.json({ error: "Execution not found" }, { status: 404 });
  }

  const token = await getClientSubscriptionToken(inngest, {
    channel: executionChannel({ executionId }),
    topics: ["node-status"],
  });

  return Response.json(token);
}
