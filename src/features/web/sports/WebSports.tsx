"use client";

import { clsx } from "clsx";
import { Search, Trophy, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { IptvChannel } from "@/lib/web/iptv-channels";
import { resolveChannelsForMatch } from "./channelResolver";
import { MatchCard } from "./MatchCard";
import { MatchDetailsModal } from "./MatchDetailsModal";
import { generateCuratedLiveMatches, SPORT_TABS } from "./sportsData";
import type { SportDiscipline, SportMatch } from "./types";

const CHANNELS_CACHE_TTL = 10 * 60 * 1000;
const channelsCacheKey = (p: string) => `megatv_web_iptv_cache_v2_${p}`;

function readCache<T>(key: string, ttl: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: T };
    if (Date.now() - parsed.at > ttl) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

export function WebSports({ profileId }: { profileId: string }) {
  const [matches, setMatches] = useState<SportMatch[]>(() => generateCuratedLiveMatches());
  const [channels, setChannels] = useState<IptvChannel[]>([]);
  const [selectedSport, setSelectedSport] = useState<SportDiscipline>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<SportMatch | null>(null);

  // Load matches from API or curated
  const loadMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/web/sports");
      if (res.ok) {
        const json = await res.json();
        if (json.matches && Array.isArray(json.matches) && json.matches.length > 0) {
          setMatches(json.matches);
        }
      }
    } catch {
      // Fallback already initialized with generateCuratedLiveMatches()
    }
  }, []);

  // Load profile IPTV channels for broadcaster resolution
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // Try local cache first
      const cached = readCache<{ channels: IptvChannel[] }>(channelsCacheKey(profileId), CHANNELS_CACHE_TTL);
      if (cached?.channels?.length) {
        if (!cancelled) setChannels(cached.channels);
        return;
      }

      try {
        const res = await fetch(`/api/web/iptv/channels?profile=${encodeURIComponent(profileId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.channels && Array.isArray(data.channels)) {
          setChannels(data.channels);
        }
      } catch {
        /* Ignore if offline */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  // Periodic refresh for live scores (every 45s)
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMatches();
    }, 0);
    const interval = setInterval(() => {
      void loadMatches();
    }, 45000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadMatches]);

  // Filter matches by sport discipline and search query
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchesSport = selectedSport === "all" || m.sport === selectedSport;
      if (!matchesSport) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        m.homeTeamName.toLowerCase().includes(q) ||
        m.awayTeamName.toLowerCase().includes(q) ||
        m.tournamentName.toLowerCase().includes(q) ||
        (m.primaryBroadcaster && m.primaryBroadcaster.toLowerCase().includes(q))
      );
    });
  }, [matches, selectedSport, searchQuery]);

  const liveMatches = useMemo(
    () => filteredMatches.filter((m) => m.status === "LIVE"),
    [filteredMatches]
  );

  const upcomingMatches = useMemo(
    () => filteredMatches.filter((m) => m.status !== "LIVE"),
    [filteredMatches]
  );

  // Map resolved IPTV channels per match ID
  const resolvedChannelsByMatchId = useMemo(() => {
    const map = new Map<string, IptvChannel[]>();
    for (const m of filteredMatches) {
      map.set(m.id, resolveChannelsForMatch(m, channels, "FR"));
    }
    return map;
  }, [filteredMatches, channels]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#e53935,#f4904a)] text-white shadow-lg shadow-red-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--mega-text)] sm:text-3xl">
                Hub Sports
              </h1>
              <p className="text-xs text-[var(--mega-text-muted)]">
                Matchs en direct, scores et retransmissions IPTV synchronisées
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-0 sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mega-text-faint)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Joueur, équipe, tournoi..."
            className="focus-ring h-11 w-full rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] pl-10 pr-9 text-sm text-[var(--mega-text)] outline-none transition placeholder:text-[var(--mega-text-faint)] focus:border-[var(--mega-border-strong)]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mega-text-faint)] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Sport Category Tabs */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SPORT_TABS.map((tab) => {
            const active = selectedSport === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSport(tab.id)}
                className={clsx(
                  "focus-ring inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition",
                  active
                    ? "bg-white text-black shadow-lg shadow-white/10"
                    : "border border-white/10 bg-[var(--mega-surface)] text-[var(--mega-text-muted)] hover:border-white/20 hover:text-white"
                )}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: EN DIRECT */}
      {liveMatches.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mega-red)] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--mega-red)]" />
              </span>
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                En direct
              </h2>
              <span className="rounded-full bg-[var(--mega-red)]/20 px-2 py-0.5 text-xs font-bold text-[var(--mega-red)]">
                {liveMatches.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                matchedChannels={resolvedChannelsByMatchId.get(match.id) || []}
                onClick={() => setSelectedMatch(match)}
                onWatchDirect={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* SECTION 2: AUJOURD'HUI & À VENIR */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-1 rounded-full bg-[var(--mega-accent)]" />
            <h2 className="text-lg font-black uppercase tracking-wider text-white">
              Aujourd&apos;hui / À venir
            </h2>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-[var(--mega-text-muted)]">
              {upcomingMatches.length}
            </span>
          </div>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                matchedChannels={resolvedChannelsByMatchId.get(match.id) || []}
                onClick={() => setSelectedMatch(match)}
                onWatchDirect={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-[var(--mega-surface)] p-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-[var(--mega-text-faint)]" />
            <p className="mt-2 text-sm font-semibold text-white">Aucun match trouvé</p>
            <p className="text-xs text-[var(--mega-text-faint)]">
              Essayez un autre mot-clé ou sélectionnez une autre discipline.
            </p>
          </div>
        )}
      </section>

      {/* Match Details Modal */}
      {selectedMatch ? (
        <MatchDetailsModal
          match={selectedMatch}
          matchedChannels={resolvedChannelsByMatchId.get(selectedMatch.id) || []}
          onClose={() => setSelectedMatch(null)}
        />
      ) : null}
    </div>
  );
}
