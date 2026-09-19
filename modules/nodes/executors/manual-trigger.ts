/** Manual trigger — passes test JSON into the workflow */
export async function runManualTrigger(config: any, item: any) {
  if (config.testJson?.trim()) {
    return JSON.parse(config.testJson);
  }
  return item ?? { message: "hello" };
}
