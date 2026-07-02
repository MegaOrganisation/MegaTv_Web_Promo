import Link from "next/link";
import { Suspense } from "react";

import { BarRankingChart } from "@/components/ui/Charts";
import { GlassCard } from "@/components/ui/GlassCard";
import { MegaLink } from "@/components/ui/MegaButton";
import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { AdminActiveUsersChart } from "@/features/admin/AdminActiveUsersChart";
import { AdminCsvExportButton } from "@/features/admin/AdminCsvExportButton";
import { AdminInfrastructurePanel, type AdminOverview } from "@/features/admin/AdminInfrastructurePanel";
import { AdminPeriodSelector } from "@/features/admin/AdminPeriodSelector";
import { AdminSentryPanel } from "@/features/admin/AdminSentryPanel";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { parseAdminPeriod, periodRange } from "@/lib/admin/period";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminDashboardData } from "@/lib/dashboard/queries";
import { fetchSentrySummary } from "@/lib/sentry-admin";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const days = parseAdminPeriod(params.days);
  const { from, to } = periodRange(days);
  const [dashboard, sentry] = await Promise.all([getAdminDashboardData(from, to), fetchSentrySummary()]);

  const topContentRows = dashboard.topContent.map((item: { title?: string | null; tmdb_id?: number; watch_seconds?: number; user_count?: number }) => ({
    label: item.title || `TMDB ${item.tmdb_id}`,
    value: Number(item.watch_seconds || 0),
    sublabel: `${item.user_count || 0} utilisateurs`
  }));

  const pageRows = dashboard.pageAnalytics.map((item: { page?: string; route?: string; views?: number; users?: number }) => ({
    label: item.page || item.route || "Page",
    value: Number(item.views || 0),
    sublabel: `${item.users || 0} utilisateurs`
  }));

  return (
    <ResponsiveShell title="Vue Admin" subtitle="Agrégats d'infrastructure, analytics Companion et monitoring Sentry. Aucun accès brut cross-user n'est exposé à l'UI." isAdmin>
      <PageEventTracker page="Companion Admin" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={null}>
          <AdminPeriodSelector activeDays={days} />
        </Suspense>
        <div className="flex flex-wrap gap-2">
          <AdminCsvExportButton days={days} />
          <MegaLink href="/companion/admin/releases" variant="ghost">
            Console OTA
          </MegaLink>
          <MegaLink href="/companion/admin/platform" variant="ghost">
            Config plateforme
          </MegaLink>
        </div>
      </div>

      {dashboard.errors.length > 0 ? (
        <GlassCard className="mb-6 border-red-300/20 bg-red-500/8">
          <p className="text-sm font-semibold text-red-100">Certaines RPC admin ont échoué.</p>
          <p className="mt-1 text-xs text-red-100/65">Vérifiez la migration SQL et votre entrée dans megacompanion_admins.</p>
        </GlassCard>
      ) : null}

      <AdminInfrastructurePanel overview={dashboard.overview as AdminOverview} periodDays={days} />

      <section className="mt-6">
        <AdminActiveUsersChart days={days} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AdminSentryPanel summary={sentry} />
        <GlassCard as="section">
          <h2 className="text-2xl font-bold text-white">Top global</h2>
          <p className="mt-2 text-sm text-white/45">Contenus agrégés sur {days} jours.</p>
          <div className="mt-6">
            <BarRankingChart rows={topContentRows.length ? topContentRows : [{ label: "Aucune donnée", value: 1, sublabel: "En attente" }]} />
          </div>
        </GlassCard>
      </section>

      <section className="mt-6">
        <GlassCard as="section">
          <h2 className="text-2xl font-bold text-white">Pages consultées</h2>
          <p className="mt-2 text-sm text-white/45">Analytics Companion agrégées uniquement.</p>
          <div className="mt-6">
            <BarRankingChart rows={pageRows.length ? pageRows : [{ label: "Aucune page trackée", value: 1, sublabel: "Activez /api/dashboard/events" }]} />
          </div>
        </GlassCard>
      </section>

      <p className="mt-6 text-center text-xs text-white/35">
        <Link href="/companion" className="hover:text-white/60">
          Retour dashboard
        </Link>
      </p>
    </ResponsiveShell>
  );
}
