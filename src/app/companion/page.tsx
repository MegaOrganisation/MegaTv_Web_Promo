import { Clock3, Film, MonitorSmartphone, PlayCircle, Tv, UsersRound } from "lucide-react";

import { BarRankingChart, DonutChart, MiniLineChart } from "@/components/ui/Charts";
import { GlassCard } from "@/components/ui/GlassCard";
import { MegaLink } from "@/components/ui/MegaButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { ContinueWatchingRail } from "@/features/dashboard/ContinueWatchingRail";
import { DeviceList } from "@/features/dashboard/DeviceList";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { PosterMetricRow } from "@/features/dashboard/PosterMetricRow";
import { ProfileSwitcher } from "@/features/dashboard/ProfileSwitcher";
import { requireUser } from "@/lib/auth/require-user";
import { formatDate, formatDuration, formatNumber } from "@/lib/format";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function CompanionPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  await requireUser("/companion");
  const activeProfileId = params.profile || null;
  const { summary, topContent, profiles, devices, continueWatching, isAdmin, errors } = await getDashboardData(activeProfileId);

  const chartRows = topContent.slice(0, 5).map((item) => ({
    label: item.title || item.episode_title || `TMDB ${item.tmdb_id}`,
    value: Number(item.watch_seconds || 0),
    sublabel: item.media_type === "tv" ? "Série" : "Film"
  }));

  return (
    <ResponsiveShell title="Dashboard" subtitle="Vos métriques MegaTv, isolées par compte et profil grâce à Supabase RLS.">
      <PageEventTracker page="Companion Dashboard" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} />
        <div className="flex gap-2">
          {isAdmin ? <MegaLink href="/companion/admin" variant="ghost">Vue admin</MegaLink> : null}
          <SignOutButton />
        </div>
      </div>

      {errors.length > 0 ? (
        <GlassCard className="mb-6 border-yellow-300/20 bg-yellow-300/8">
          <p className="text-sm font-semibold text-yellow-100">Certaines données ne sont pas encore disponibles.</p>
          <p className="mt-1 text-xs text-yellow-100/65">Appliquez la migration MegaCompagnon et vérifiez les variables Supabase si les blocs restent vides.</p>
        </GlassCard>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Films regardés" value={formatNumber(summary.movies_watched)} hint="Depuis MegaTv Cloud" icon={Film} tone="blue" />
        <KpiCard label="Épisodes regardés" value={formatNumber(summary.episodes_watched)} hint="Synchronisation profilée" icon={Tv} tone="green" />
        <KpiCard label="Temps total" value={formatDuration(summary.total_watch_seconds)} hint="Progression + événements" icon={Clock3} tone="gold" />
        <KpiCard label="Reprises" value={formatNumber(summary.continue_watching_count)} hint="Continue Watching" icon={PlayCircle} tone="pink" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <GlassCard as="section">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Continuer à regarder</h2>
              <p className="mt-1 text-sm text-white/45">Progressions MegaTv synchronisées par profil.</p>
            </div>
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/45">{formatDate(summary.last_activity_at)}</span>
          </div>
          <ContinueWatchingRail items={continueWatching} />
        </GlassCard>

        <GlassCard as="section">
          <h2 className="text-xl font-bold text-white">Répartition</h2>
          <p className="mt-1 text-sm text-white/45">Films, séries et visites Companion.</p>
          <div className="mt-6">
            <DonutChart
              label="Répartition de l'activité"
              segments={[
                { label: "Films", value: summary.movies_watched || 1, color: "#3f9ae6" },
                { label: "Épisodes", value: summary.episodes_watched || 1, color: "#d8497f" },
                { label: "Pages", value: summary.page_views_30d || 1, color: "#f2b43c" }
              ]}
            />
          </div>
        </GlassCard>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard as="section">
          <h2 className="text-xl font-bold text-white">Top contenus</h2>
          <p className="mt-1 text-sm text-white/45">Classement par temps de lecture.</p>
          <div className="mt-5 space-y-3">
            {topContent.length > 0 ? topContent.slice(0, 5).map((item, index) => <PosterMetricRow key={`${item.media_type}-${item.tmdb_id}-${item.season}-${item.episode}`} item={item} rank={index + 1} />) : <p className="text-sm text-white/45">Aucun top contenu pour le moment.</p>}
          </div>
        </GlassCard>

        <GlassCard as="section">
          <h2 className="text-xl font-bold text-white">Progression récente</h2>
          <p className="mt-1 text-sm text-white/45">Un aperçu visuel mobile-first, prêt pour données temporelles.</p>
          <div className="mt-5">
            <MiniLineChart points={[12, 22, 18, 38, 30, 46, 36, 54, 48, 62, 72]} />
          </div>
          <BarRankingChart rows={chartRows.length ? chartRows : [{ label: "En attente de données", value: 1, sublabel: "Migration/API" }]} />
        </GlassCard>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard as="section">
          <div className="mb-5 flex items-center gap-3">
            <UsersRound className="h-5 w-5 text-white/70" />
            <div>
              <h2 className="text-xl font-bold text-white">Profils</h2>
              <p className="text-sm text-white/45">{formatNumber(summary.profile_count)} profils cloud.</p>
            </div>
          </div>
          <ProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} />
        </GlassCard>
        <GlassCard as="section">
          <div className="mb-5 flex items-center gap-3">
            <MonitorSmartphone className="h-5 w-5 text-white/70" />
            <div>
              <h2 className="text-xl font-bold text-white">Appareils</h2>
              <p className="text-sm text-white/45">{formatNumber(summary.device_count)} appareils liés au compte.</p>
            </div>
          </div>
          <DeviceList devices={devices} />
        </GlassCard>
      </section>
    </ResponsiveShell>
  );
}
