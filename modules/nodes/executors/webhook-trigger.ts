/** Webhook trigger — live POST body on Execution.data; testJson for Run */
export async function runWebhookTrigger(config: any, item: any) {
  const empty = !item || Object.keys(item).length === 0;
  if (empty && config.testJson?.trim()) {
    return JSON.parse(config.testJson);
  }
  return item ?? {};
}
