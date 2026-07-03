import type { AdminOverview } from "@/features/admin/AdminInfrastructurePanel";
import { AdminCompanionPage } from "@/features/admin/AdminCompanionPage";
import { parseAdminPeriod, periodRange } from "@/lib/admin/period";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminDashboardData } from "@/lib/dashboard/queries";
import { fetchSentrySummary } from "@/lib/sentry-admin";

export const dynamic = "force-dynamic";

type TopContentRow = { title?: string | null; tmdb_id?: number; watch_seconds?: number; user_count?: number };
type PageAnalyticsRow = { page?: string; route?: string; views?: number; users?: number };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const days = parseAdminPeriod(params.days);
  const { from, to } = periodRange(days);

  let dashboard: Awaited<ReturnType<typeof getAdminDashboardData>>;
  let sentry: Awaited<ReturnType<typeof fetchSentrySummary>>;
  try {
    [dashboard, sentry] = await Promise.all([getAdminDashboardData(from, to), fetchSentrySummary()]);
  } catch {
    dashboard = { overview: null, topContent: [], pageAnalytics: [], errors: ["Impossible de charger les agrégats admin."] };
    sentry = { configured: false, unresolvedIssues: 0, topIssues: [], projects: [] };
  }

  const topContentRows = (Array.isArray(dashboard.topContent) ? dashboard.topContent : []).map((item: TopContentRow) => ({
    label: item.title || `TMDB ${item.tmdb_id ?? "?"}`,
    value: Number(item.watch_seconds || 0),
    sublabel: `${item.user_count || 0} utilisateurs`
  }));

  const pageRows = (Array.isArray(dashboard.pageAnalytics) ? dashboard.pageAnalytics : []).map((item: PageAnalyticsRow) => ({
    label: item.page || item.route || "Page",
    value: Number(item.views || 0),
    sublabel: `${item.users || 0} utilisateurs`
  }));

  return (
    <AdminCompanionPage
      days={days}
      overview={(dashboard.overview as AdminOverview) ?? null}
      topContentRows={topContentRows}
      pageRows={pageRows}
      sentry={sentry}
      errors={dashboard.errors}
    />
  );
}
