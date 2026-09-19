import { staticSchema } from "inngest";
import { channel } from "inngest/realtime";

/** Live node status on canvas */
export const executionChannel = channel({
  name: (params: { executionId: string }) => `execution:${params.executionId}`,
  topics: {
    "node-status": {
      schema: staticSchema<{
        nodeId: string;
        status: "running" | "success" | "error";
        output?: unknown;
        error?: string;
      }>(),
    },
  },
});
