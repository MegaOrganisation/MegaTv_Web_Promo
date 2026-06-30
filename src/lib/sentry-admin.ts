export type SentrySummary = {
  configured: boolean;
  unresolvedIssues: number;
  topIssues: Array<{
    id: string;
    title: string;
    culprit: string | null;
    level: string | null;
    count: string | null;
    userCount: number | null;
    lastSeen: string | null;
    permalink: string | null;
    project: string;
  }>;
  projects: string[];
};

type SentryIssue = {
  id: string;
  title: string;
  culprit?: string;
  level?: string;
  count?: string;
  userCount?: number;
  lastSeen?: string;
  permalink?: string;
  project?: { slug?: string };
};

export async function fetchSentrySummary(): Promise<SentrySummary> {
  const token = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;
  const projects = [process.env.SENTRY_PROJECT_ANDROID, process.env.SENTRY_PROJECT_WEB].filter(Boolean) as string[];
  const environment = process.env.SENTRY_ENVIRONMENT;

  if (!token || !org || projects.length === 0) {
    return { configured: false, unresolvedIssues: 0, topIssues: [], projects };
  }

  const query = new URLSearchParams();
  query.set("query", "is:unresolved");
  query.set("sort", "freq");
  query.set("limit", "8");
  if (environment) query.set("environment", environment);
  projects.forEach((project) => query.append("project", project));

  const response = await fetch(`https://sentry.io/api/0/organizations/${encodeURIComponent(org)}/issues/?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    return { configured: true, unresolvedIssues: 0, topIssues: [], projects };
  }

  const issues = (await response.json()) as SentryIssue[];
  return {
    configured: true,
    unresolvedIssues: issues.length,
    projects,
    topIssues: issues.map((issue) => ({
      id: issue.id,
      title: sanitize(issue.title),
      culprit: issue.culprit ? sanitize(issue.culprit) : null,
      level: issue.level || null,
      count: issue.count || null,
      userCount: typeof issue.userCount === "number" ? issue.userCount : null,
      lastSeen: issue.lastSeen || null,
      permalink: issue.permalink || null,
      project: issue.project?.slug || "sentry"
    }))
  };
}

function sanitize(value: string) {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/(api_key|apikey|access_token|refresh_token|token)=([^&\s]+)/gi, "$1=[redacted]")
    .slice(0, 240);
}
