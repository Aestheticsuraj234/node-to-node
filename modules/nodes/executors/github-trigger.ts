function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function flattenGithubEvent(payload: Record<string, any>) {
  const issue = asRecord(payload.issue);
  const pullRequest = asRecord(payload.pull_request);
  const repository = asRecord(payload.repository);
  const sender = asRecord(payload.sender);
  const headCommit = asRecord(payload.head_commit);

  return {
    ...payload,
    event: payload.event ?? "",
    action: payload.action ?? "",
    repository:
      typeof payload.repository === "string"
        ? payload.repository
        : (repository?.full_name ?? ""),
    title:
      issue?.title ??
      pullRequest?.title ??
      headCommit?.message ??
      payload.title ??
      "",
    body: issue?.body ?? pullRequest?.body ?? payload.body ?? "",
    url:
      issue?.html_url ??
      pullRequest?.html_url ??
      repository?.html_url ??
      payload.url ??
      "",
    sender:
      typeof payload.sender === "string"
        ? payload.sender
        : (sender?.login ?? ""),
  };
}

/** GitHub trigger — live event on Execution.data; testJson for Run */
export async function runGithubTrigger(config: any, item: any) {
  const empty = !item || Object.keys(item).length === 0;
  const payload =
    empty && config.testJson?.trim()
      ? JSON.parse(config.testJson)
      : (item ?? {});

  return flattenGithubEvent(payload);
}
