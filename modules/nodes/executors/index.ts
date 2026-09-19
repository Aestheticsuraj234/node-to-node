import { runHttpRequest } from "@/modules/nodes/executors/http-request";
import { runManualTrigger } from "@/modules/nodes/executors/manual-trigger";

const EXECUTORS: Record<string, (config: any, item: any) => Promise<any>> = {
  "manual-trigger": runManualTrigger,
  "http-request": runHttpRequest,
};

export async function runNode(nodeType: string, config: any, item: any) {
  const fn = EXECUTORS[nodeType];
  if (!fn) throw new Error(`No executor for node type: ${nodeType}`);
  return fn(config, item);
}
