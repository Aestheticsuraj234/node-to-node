import { interpolate } from "@/modules/engine/lib/template";

/** HTTP Request — one fetch call, no abstractions */
export async function runHttpRequest(config: any, item: any) {
  const url = interpolate(config.url ?? "", item);
  const method = config.method ?? "GET";
  const body =
    method !== "GET" && config.body
      ? interpolate(config.body, item)
      : undefined;

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body,
  });

  const data = await res.json();
  return { ...item, data, status: res.status };
}
