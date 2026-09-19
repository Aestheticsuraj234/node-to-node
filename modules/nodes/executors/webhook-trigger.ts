/** Webhook trigger — payload already loaded into item from Execution.data */
export async function runWebhookTrigger(_config: any, item: any) {
  return item ?? {};
}
