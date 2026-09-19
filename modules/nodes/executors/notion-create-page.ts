import { interpolate } from "@/modules/engine/lib/template";

const NOTION_TEXT_LIMIT = 2000;

function chunkText(text: string, max = NOTION_TEXT_LIMIT) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += max) {
    chunks.push(text.slice(i, i + max));
  }
  return chunks;
}

/** Create a Notion page — token in .env */
export async function runNotionCreatePage(config: any, item: any) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN missing in .env");

  let parentId = interpolate(config.parentId ?? "", item);
  if (!parentId || parentId.includes("YOUR_NOTION")) {
    parentId = process.env.NOTION_PARENT_PAGE_ID ?? "";
  }
  if (!parentId) throw new Error("Set Parent page ID in node config or NOTION_PARENT_PAGE_ID in .env");
  const title = interpolate(config.title ?? "", item).slice(0, NOTION_TEXT_LIMIT);
  const content = interpolate(config.content ?? "", item);

  const children = content
    ? chunkText(content).map((chunk) => ({
        object: "block" as const,
        type: "paragraph" as const,
        paragraph: { rich_text: [{ text: { content: chunk } }] },
      }))
    : [];

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { page_id: parentId },
      properties: {
        title: { title: [{ text: { content: title } }] },
      },
      children,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Notion API error");

  return { ...item, id: data.id, url: data.url };
}
