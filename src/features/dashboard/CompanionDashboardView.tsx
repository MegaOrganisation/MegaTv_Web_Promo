"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Film, History, PlayCircle, Tv } from "lucide-react";

import { CinemaGlassTile } from "@/components/ui/CinemaGlassTile";
import { ActivityRingChart } from "@/features/dashboard/ActivityRingChart";
import { ContinueWatchingBlock } from "@/features/dashboard/ContinueWatchingBlock";
import { DashboardLayoutShell } from "@/features/dashboard/DashboardLayoutShell";
import {
  TopActorsRankingChart,
  TopChannelsRankingChart,
  TopContentRankingChart
} from "@/features/dashboard/DashboardRankingCharts";
import { TonightTvRail } from "@/features/dashboard/TonightTvRail";
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
  /** Conservé pour libellés éventuels — même layout pour tous les profils (Kids inclus). */
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
  const [ringSize, setRingSize] = useState(250);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setRingSize(mq.matches ? 176 : 250);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /** Films regardés = uniques (terminé OU en cours) — même chiffre KPI + Répartition. */
  const moviesWatchedCount = useMemo(() => {
    const ids = new Set<number>();
    for (const row of watchHistory) {
      if (row.media_type === "movie" && Number(row.tmdb_id) > 0) ids.add(Number(row.tmdb_id));
    }
    for (const row of continueWatching) {
      if (row.media_type === "movie" && Number(row.tmdb_id) > 0) ids.add(Number(row.tmdb_id));
    }
    return Math.max(ids.size, Number(summary.movies_watched) || 0);
  }, [watchHistory, continueWatching, summary.movies_watched]);

  const kidsHint = isKids ? "Profil Kids" : undefined;

  return (
    <div className="dashboard-stack w-full space-y-4">
      <TonightTvRail />
      <DashboardLayoutShell
        editMode={editMode}
        onEditModeChange={onEditModeChange}
        blocks={{
          "kpi-movies": (
            <KpiCard
              label="Films regardés"
              value={formatNumber(moviesWatchedCount)}
              hint={kidsHint || "Terminés + en cours"}
              icon={Film}
              tone="blue"
              index={0}
            />
          ),
          "kpi-episodes": (
            <KpiCard
              label="Épisodes regardés"
              value={formatNumber(summary.episodes_watched)}
              hint={kidsHint || "Synchronisation profilée"}
              icon={Tv}
              tone="green"
              index={1}
            />
          ),
          "kpi-time": (
            <KpiCard
              label="Temps total"
              value={formatDuration(summary.total_watch_seconds)}
              hint={kidsHint || "Progression + événements"}
              icon={Clock3}
              tone="gold"
              index={2}
            />
          ),
          "kpi-continue": (
            <KpiCard
              label="Reprises"
              value={formatNumber(summary.continue_watching_count)}
              hint={kidsHint || "Encart Reprendre"}
              icon={PlayCircle}
              tone="pink"
              index={3}
            />
          ),
          "continue-watching": (
            <CinemaGlassTile index={3} className="dashboard-panel-full dashboard-panel-pad h-full overflow-visible">
              <ContinueWatchingBlock items={continueWatching} />
            </CinemaGlassTile>
          ),
          "donut-chart": (
            <CinemaGlassTile id="overview" index={4} className="dashboard-panel-full dashboard-panel-pad">
              <h2 className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">Répartition</h2>
              <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Films et épisodes regardés (y compris en cours).</p>
              <div className="mt-4 w-full min-w-0 sm:mt-5">
                <ActivityRingChart
                  defaultLabel="Activité"
                  size={ringSize}
                  segments={[
                    { label: "Films", value: moviesWatchedCount, color: "#22c55e" },
                    { label: "Épisodes", value: summary.episodes_watched || 0, color: "#a78bfa" }
                  ]}
                />
              </div>
            </CinemaGlassTile>
          ),
          "top-content": <TopContentRankingChart items={topByWatchTime} />,
          "top-actors": <TopActorsRankingChart profileId={activeProfileId} seedTitles={topByWatchTime} />,
          "activity-chart": <TopChannelsRankingChart profileId={activeProfileId} />,
          history: (
            <CinemaGlassTile id="history" index={8} className="dashboard-panel-full dashboard-panel-pad">
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
          movies: moviesWatchedCount,
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
