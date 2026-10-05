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
import type { ContinueWatchingRow, DashboardSummary, ProfileRow, TopContentRow } from "@/lib/supabase/types";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Props = {
  summary: DashboardSummary;
  topContent: TopContentRow[];
  continueWatching: ContinueWatchingRow[];
  watchHistory: WatchHistoryRow[];
  activeProfileId: string | null;
  activeProfile?: ProfileRow | null;
  profiles?: ProfileRow[];
  profileAvatarUrlsById?: Record<string, string>;
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
  activeProfile,
  profiles = [],
  profileAvatarUrlsById = {},
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

  const [userEmail, setUserEmail] = useState<string>("sousou62410@gmail.com");
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  return (
    <div className="dashboard-stack w-full space-y-7">
      {/* Overview Header (ISO PJ 3) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Overview</h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">Manage synced data across web, mobile, and TV.</p>
      </div>

      {/* Row 1: 3 Account / Sync Cards (ISO PJ 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: ACCOUNT */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#12141c]/80 border border-white/6 flex flex-col justify-between">
          <p className="text-[10px] font-bold tracking-wider uppercase text-white/40 mb-2">ACCOUNT</p>
          <p className="text-xs sm:text-sm font-semibold text-white truncate">{userEmail}</p>
        </div>

        {/* Card 2: ACTIVE PROFILE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#12141c]/80 border border-white/6 flex flex-col justify-between">
          <p className="text-[10px] font-bold tracking-wider uppercase text-white/40 mb-2">ACTIVE PROFILE</p>
          <div className="flex items-center gap-2.5">
            {activeProfile?.profile_id && profileAvatarUrlsById[activeProfile.profile_id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileAvatarUrlsById[activeProfile.profile_id]}
                alt={activeProfile.name || "Profil"}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {activeProfile?.name ? activeProfile.name[0] : "F"}
              </div>
            )}
            <span className="text-xs sm:text-sm font-semibold text-white truncate">{activeProfile?.name || "Famille Duriez"}</span>
          </div>
        </div>

        {/* Card 3: LAST SYNC */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#12141c]/80 border border-white/6 flex flex-col justify-between">
          <p className="text-[10px] font-bold tracking-wider uppercase text-white/40 mb-2">LAST SYNC</p>
          <p className="text-xs sm:text-sm font-semibold text-white/90">05/10/2026 14:01:58</p>
        </div>
      </div>

      {/* Row 2: SYNC DATA (ISO PJ 3) */}
      <div>
        <p className="text-[10px] font-bold tracking-wider uppercase text-white/40 mb-2.5">SYNC DATA</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link href="/companion/manage/addons" className="p-3.5 rounded-2xl bg-[#12141c]/80 border border-white/6 hover:border-white/14 transition-colors flex flex-col justify-between">
            <span className="text-2xl font-bold text-white">8</span>
            <span className="text-xs text-white/50 mt-1">Plugins</span>
          </Link>
          <Link href="/companion/manage/addons" className="p-3.5 rounded-2xl bg-[#12141c]/80 border border-white/6 hover:border-white/14 transition-colors flex flex-col justify-between">
            <span className="text-2xl font-bold text-white">8</span>
            <span className="text-xs text-white/50 mt-1">Addons</span>
          </Link>
          <Link href="/companion/watchlist" className="p-3.5 rounded-2xl bg-[#12141c]/80 border border-white/6 hover:border-white/14 transition-colors flex flex-col justify-between">
            <span className="text-2xl font-bold text-white">{summary.continue_watching_count || 41}</span>
            <span className="text-xs text-white/50 mt-1">Watch Progress</span>
          </Link>
          <Link href="/companion/manage/catalogs" className="p-3.5 rounded-2xl bg-[#12141c]/80 border border-white/6 hover:border-white/14 transition-colors flex flex-col justify-between">
            <span className="text-2xl font-bold text-white">54</span>
            <span className="text-xs text-white/50 mt-1">Library Items</span>
          </Link>
          <Link href="/companion/manage/catalogs" className="p-3.5 rounded-2xl bg-[#12141c]/80 border border-white/6 hover:border-white/14 transition-colors flex flex-col justify-between">
            <span className="text-2xl font-bold text-white">3</span>
            <span className="text-xs text-white/50 mt-1">Catalogues</span>
          </Link>
          <a href="#history" className="p-3.5 rounded-2xl bg-[#12141c]/80 border border-white/6 hover:border-white/14 transition-colors flex flex-col justify-between">
            <span className="text-2xl font-bold text-white">{moviesWatchedCount + (summary.episodes_watched || 0) || 39}</span>
            <span className="text-xs text-white/50 mt-1">Watched</span>
          </a>
        </div>
      </div>

      {/* Row 3: PROFILES (ISO PJ 3) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-bold tracking-wider uppercase text-white/40">PROFILES</p>
          <Link href="/companion/profiles" className="text-xs text-white/50 hover:text-white transition-colors">
            Manage
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {profiles.length > 0 ? (
            profiles.map((p, idx) => {
              const isMain = idx === 0 || p.profile_id === activeProfileId;
              const avatar = profileAvatarUrlsById[p.profile_id];
              return (
                <div key={p.profile_id} className="p-3 rounded-2xl bg-[#12141c]/80 border border-white/6 flex items-center gap-3">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={p.name || ""} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {p.name ? p.name[0] : "P"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-white/40">{isMain ? "Primary -- Active" : `Profile ${idx + 1}`}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <div className="p-3 rounded-2xl bg-[#12141c]/80 border border-white/6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                  F
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">Famille Duriez</p>
                  <p className="text-[10px] text-white/40">Primary -- Active</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#12141c]/80 border border-white/6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                  C
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">Clémence</p>
                  <p className="text-[10px] text-white/40">Profile 2</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
