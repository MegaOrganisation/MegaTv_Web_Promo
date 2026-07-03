"use client";

import { Clock3, Film, History, PlayCircle, Tv } from "lucide-react";

import { InteractiveBarRankingChart, InteractiveDonutChart } from "@/components/ui/Charts";
import { ActivitySparkline } from "@/features/dashboard/ActivitySparkline";
import { ContinueWatchingRail } from "@/features/dashboard/ContinueWatchingRail";
import { DashboardLayoutShell } from "@/features/dashboard/DashboardLayoutShell";
import { PosterMetricRow } from "@/features/dashboard/PosterMetricRow";
import { WatchHistoryPanel } from "@/features/dashboard/WatchHistoryPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { KpiCard } from "@/components/ui/KpiCard";
import { formatDate, formatDuration, formatNumber } from "@/lib/format";
import type { ContinueWatchingRow, DashboardSummary, TopContentRow } from "@/lib/supabase/types";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";

type Props = {
  summary: DashboardSummary;
  topContent: TopContentRow[];
  continueWatching: ContinueWatchingRow[];
  watchHistory: WatchHistoryRow[];
  activeProfileId: string | null;
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
};

export function CompanionDashboardView({ summary, topContent, continueWatching, watchHistory, activeProfileId, editMode, onEditModeChange }: Props) {
  const chartRows = topContent.slice(0, 5).map((item) => ({
    label: item.title || item.episode_title || `TMDB ${item.tmdb_id}`,
    value: Number(item.watch_seconds || 0),
    sublabel: item.media_type === "tv" ? "Série" : "Film"
  }));

  const totalSessions = watchHistory.length;
  const totalWatchFromEvents = watchHistory.reduce((sum, row) => sum + Number(row.watch_seconds || 0), 0);

  return (
    <DashboardLayoutShell
      editMode={editMode}
      onEditModeChange={onEditModeChange}
      blocks={{
        "kpi-movies": <KpiCard label="Films regardés" value={formatNumber(summary.movies_watched)} hint="Depuis MegaTv Cloud" icon={Film} tone="blue" />,
        "kpi-episodes": <KpiCard label="Épisodes regardés" value={formatNumber(summary.episodes_watched)} hint="Synchronisation profilée" icon={Tv} tone="green" />,
        "kpi-time": <KpiCard label="Temps total" value={formatDuration(summary.total_watch_seconds)} hint="Progression + événements" icon={Clock3} tone="gold" />,
        "kpi-continue": <KpiCard label="Reprises" value={formatNumber(summary.continue_watching_count)} hint="Continue Watching" icon={PlayCircle} tone="pink" />,
        "continue-watching": (
          <GlassCard as="section">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--mega-text)]">Continuer à regarder</h2>
                <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Progressions MegaTv synchronisées par profil.</p>
              </div>
              <span className="rounded-full bg-[var(--mega-card-bg)] px-3 py-1 text-xs text-[var(--mega-text-faint)]">{formatDate(summary.last_activity_at)}</span>
            </div>
            <ContinueWatchingRail items={continueWatching} />
          </GlassCard>
        ),
        "donut-chart": (
          <GlassCard as="section">
            <h2 className="text-xl font-bold text-[var(--mega-text)]">Répartition</h2>
            <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Films, séries et visites Companion.</p>
            <div className="mt-6">
              <InteractiveDonutChart
                label="Répartition de l'activité"
                segments={[
                  { label: "Films", value: summary.movies_watched || 1, color: "#3f9ae6" },
                  { label: "Épisodes", value: summary.episodes_watched || 1, color: "#d8497f" },
                  { label: "Pages", value: summary.page_views_30d || 1, color: "#f2b43c" }
                ]}
              />
            </div>
          </GlassCard>
        ),
        "top-content": (
          <GlassCard as="section">
            <h2 className="text-xl font-bold text-[var(--mega-text)]">Top contenus</h2>
            <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Classement par temps de lecture.</p>
            <div className="mt-5 space-y-3">
              {topContent.length > 0 ? topContent.slice(0, 5).map((item, index) => <PosterMetricRow key={`${item.media_type}-${item.tmdb_id}-${item.season}-${item.episode}`} item={item} rank={index + 1} />) : <p className="text-sm text-[var(--mega-text-faint)]">Aucun top contenu pour le moment.</p>}
            </div>
          </GlassCard>
        ),
        "activity-chart": (
          <GlassCard as="section">
            <h2 className="text-xl font-bold text-[var(--mega-text)]">Progression récente</h2>
            <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Activité quotidienne (reprises + pages Companion).</p>
            <div className="mt-5">
              <ActivitySparkline profileId={activeProfileId} />
            </div>
            <InteractiveBarRankingChart rows={chartRows.length ? chartRows : [{ label: "En attente de données", value: 1, sublabel: "Migration/API" }]} />
          </GlassCard>
        ),
        history: (
          <GlassCard as="section">
            <div className="mb-4 flex items-center gap-3">
              <History className="h-5 w-5 shrink-0 text-[var(--mega-text-muted)]" />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-[var(--mega-text)]">Historique des visionnages</h2>
              </div>
            </div>
            <WatchHistoryPanel
              rows={watchHistory}
              subtitle={`${totalSessions} événements · ${formatDuration(totalWatchFromEvents)} cumulés (date, heure, durée)`}
            />
          </GlassCard>
        )
      }}
      metrics={{
        movies: summary.movies_watched,
        episodes: summary.episodes_watched,
        watchTime: summary.total_watch_seconds,
        continue: summary.continue_watching_count,
        pageViews: summary.page_views_30d,
        historyEvents: totalSessions
      }}
    />
  );
}
