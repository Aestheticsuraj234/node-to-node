import { interpolate } from "@/modules/engine/lib/template";

/** Map fields — one line per mapping: target: {{source}} */
export async function runSetFields(config: any, item: any) {
  const result = { ...item };

  for (const line of (config.fields || "").split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;

    const target = line.slice(0, colon).trim();
    const template = line.slice(colon + 1).trim();
    if (!target) continue;

    result[target] = interpolate(template, item);
  }

  return result;
}
