import { inngest } from "@/modules/inngest/client";
import { executionChannel } from "@/modules/inngest/realtime/channels";

export type NodeStatusPayload = {
  nodeId: string;
  status: "running" | "success" | "error";
  output?: unknown;
  error?: string;
};

/** Push live node status to the canvas (non-durable — fine inside LangGraph step) */
export async function publishNodeStatus(
  executionId: string,
  payload: NodeStatusPayload,
) {
  try {
    const ch = executionChannel({ executionId });
    await inngest.realtime.publish(ch["node-status"], payload);
  } catch {
    // Realtime is optional in local dev if Inngest dev server isn't running
  }
}
