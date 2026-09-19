import { interpolate } from "@/modules/engine/lib/template";

/** Create a GitHub issue — token in .env */
export async function runGithubCreateIssue(config: any, item: any) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN missing in .env");

  const repo = interpolate(config.repo ?? "", item);
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error("Repository must be owner/repo");

  const title = interpolate(config.title ?? "", item);
  const body = interpolate(config.body ?? "", item);

  const res = await fetch(`https://api.github.com/repos/${owner}/${name}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "GitHub API error");

  return { ...item, number: data.number, url: data.html_url, title: data.title };
}
