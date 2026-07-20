"use client";

import { useMemo } from "react";
import { Clock3, Film, History, PlayCircle, Tv } from "lucide-react";

import { CinemaGlassTile } from "@/components/ui/CinemaGlassTile";
import { CinemaRechartsDonut } from "@/components/ui/CinemaRecharts";
import { ActivitySparkline } from "@/features/dashboard/ActivitySparkline";
import { ContinueWatchingBlock } from "@/features/dashboard/ContinueWatchingBlock";
import { DashboardLayoutShell } from "@/features/dashboard/DashboardLayoutShell";
import { TonightTvRail } from "@/features/dashboard/TonightTvRail";
import { TopContentLandscapeRail } from "@/features/dashboard/TopContentLandscapeRail";
import { WatchHistoryPanel } from "@/features/dashboard/WatchHistoryPanel";
import { KpiCard } from "@/components/ui/KpiCard";
import { buildTopContentByWatchTime } from "@/lib/dashboard/buildTopContentByWatchTime";
import { formatDuration, formatNumber } from "@/lib/format";
import type { ContinueWatchingRow, DashboardSummary, TopContentRow } from "@/lib/supabase/types";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";

type Props = {
  summary: DashboardSummary;
  topContent: TopContentRow[];
  continueWatching: ContinueWatchingRow[];
  watchHistory: WatchHistoryRow[];
  activeProfileId: string | null;
  isKids?: boolean;
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
};

export function CompanionDashboardView({
  summary,
  topContent,
  continueWatching,
  watchHistory,
  activeProfileId,
  isKids = false,
  editMode,
  onEditModeChange
}: Props) {
  const totalSessions = watchHistory.length;
  const totalWatchFromEvents = watchHistory.reduce((sum, row) => sum + Number(row.watch_seconds || 0), 0);
  const topByWatchTime = useMemo(
    () => buildTopContentByWatchTime(watchHistory, topContent, 12),
    [watchHistory, topContent]
  );

  if (isKids) {
    return (
      <div className="dashboard-stack space-y-4 sm:space-y-6">
        <TonightTvRail />
        <div className="mega-cinema-kpi-bento grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Films regardés" value={formatNumber(summary.movies_watched)} hint="Profil Kids" icon={Film} tone="blue" index={0} />
          <KpiCard label="Épisodes regardés" value={formatNumber(summary.episodes_watched)} hint="Profil Kids" icon={Tv} tone="green" index={1} />
          <KpiCard label="Temps total" value={formatDuration(summary.total_watch_seconds)} hint="Progression" icon={Clock3} tone="gold" index={2} />
          <KpiCard label="Reprises" value={formatNumber(summary.continue_watching_count)} hint="Continuer" icon={PlayCircle} tone="pink" index={3} />
        </div>
        <CinemaGlassTile index={1} className="dashboard-panel-full dashboard-panel-pad overflow-visible">
          <ContinueWatchingBlock items={continueWatching} />
        </CinemaGlassTile>
        <CinemaGlassTile index={2} className="dashboard-panel-full dashboard-panel-pad overflow-visible">
          <TopContentLandscapeRail items={topByWatchTime} />
        </CinemaGlassTile>
        <CinemaGlassTile id="history" index={3} className="dashboard-panel-full dashboard-panel-pad">
          <div className="mb-4 flex items-center gap-3">
            <History className="h-5 w-5 shrink-0 text-[var(--mega-text-muted)]" />
            <h2 className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">Historique</h2>
          </div>
          <WatchHistoryPanel rows={watchHistory} subtitle={`${totalSessions} événements`} />
        </CinemaGlassTile>
      </div>
    );
  }

  return (
    <div className="dashboard-stack space-y-4 sm:space-y-6">
      <TonightTvRail className="mb-1" />
      <DashboardLayoutShell
        editMode={editMode}
        onEditModeChange={onEditModeChange}
        blocks={{
          "kpi-movies": (
            <KpiCard label="Films regardés" value={formatNumber(summary.movies_watched)} hint="Depuis MegaTv Cloud" icon={Film} tone="blue" index={0} />
          ),
          "kpi-episodes": (
            <KpiCard
              label="Épisodes regardés"
              value={formatNumber(summary.episodes_watched)}
              hint="Synchronisation profilée"
              icon={Tv}
              tone="green"
              index={1}
            />
          ),
          "kpi-time": (
            <KpiCard
              label="Temps total"
              value={formatDuration(summary.total_watch_seconds)}
              hint="Progression + événements"
              icon={Clock3}
              tone="gold"
              index={2}
            />
          ),
          "kpi-continue": (
            <KpiCard label="Reprises" value={formatNumber(summary.continue_watching_count)} hint="Encart Reprendre" icon={PlayCircle} tone="pink" index={3} />
          ),
          "continue-watching": (
            <CinemaGlassTile index={3} className="dashboard-panel-full dashboard-panel-pad h-full overflow-visible">
              <ContinueWatchingBlock items={continueWatching} />
            </CinemaGlassTile>
          ),
          "donut-chart": (
            <CinemaGlassTile id="overview" index={4} className="dashboard-panel-full dashboard-panel-pad">
              <h2 className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">Répartition</h2>
              <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Films, séries et visites Companion.</p>
              <div className="mt-4 w-full min-w-0 sm:mt-5">
                <CinemaRechartsDonut
                  label="Répartition de l'activité"
                  segments={[
                    { label: "Films", value: summary.movies_watched || 1, color: "#3f9ae6" },
                    { label: "Épisodes", value: summary.episodes_watched || 1, color: "#d8497f" },
                    { label: "Pages", value: summary.page_views_30d || 1, color: "#f2b43c" }
                  ]}
                />
              </div>
            </CinemaGlassTile>
          ),
          "top-content":
            topByWatchTime.length > 0 ? (
              <CinemaGlassTile index={5} className="dashboard-panel-full dashboard-panel-pad overflow-visible">
                <TopContentLandscapeRail items={topByWatchTime} />
              </CinemaGlassTile>
            ) : (
              <CinemaGlassTile index={5} className="dashboard-panel-full dashboard-panel-pad">
                <h2 className="text-lg font-bold text-[var(--mega-text)]">Top contenus</h2>
                <p className="mt-1 text-sm text-[var(--mega-text-muted)]">
                  Classement par temps de visionnage cumulé — indépendant des filtres Historique.
                </p>
                <p className="mt-3 text-sm text-[var(--mega-text-faint)]">Aucun top contenu pour le moment.</p>
              </CinemaGlassTile>
            ),
          "activity-chart": (
            <CinemaGlassTile id="activity" index={6} className="dashboard-panel-full dashboard-panel-pad">
              <h2 className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">Progression récente</h2>
              <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Activité quotidienne (reprises + pages Companion).</p>
              <div className="mt-4 w-full min-w-0 sm:mt-5">
                <ActivitySparkline profileId={activeProfileId} />
              </div>
            </CinemaGlassTile>
          ),
          history: (
            <CinemaGlassTile id="history" index={7} className="dashboard-panel-full dashboard-panel-pad">
              <div className="mb-4 flex items-center gap-3">
                <History className="h-5 w-5 shrink-0 text-[var(--mega-text-muted)]" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">Historique des visionnages</h2>
                </div>
              </div>
              <WatchHistoryPanel
                rows={watchHistory}
                subtitle={`${totalSessions} événements · ${formatDuration(totalWatchFromEvents)} cumulés (date, heure, durée)`}
              />
            </CinemaGlassTile>
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
    </div>
  );
}
