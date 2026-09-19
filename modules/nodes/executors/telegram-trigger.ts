/** Telegram trigger — webhook payload on Execution.data; testJson for Run button */
export async function runTelegramTrigger(config: any, item: any) {
  const empty = !item || Object.keys(item).length === 0;
  if (empty && config.testJson?.trim()) {
    return JSON.parse(config.testJson);
  }
  return item ?? {};
}
