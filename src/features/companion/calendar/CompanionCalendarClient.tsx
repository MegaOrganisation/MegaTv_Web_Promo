"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";

import {
  WatchHistoryCalendarView,
  type CalendarContentMode
} from "@/features/dashboard/WatchHistoryCalendarView";
import { TonightTvRail } from "@/features/dashboard/TonightTvRail";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";

type ReleaseDay = {
  date: string;
  title: string;
  mediaType: "movie" | "tv";
  posterPath?: string | null;
  tmdbId?: number | null;
  popularity?: number;
  voteAverage?: number;
};

type ReleaseSort = "anticipated" | "date" | "rating";
type ReleaseFilter = "all" | "movie" | "tv";
type CalendarTab = CalendarContentMode | "tonight";

type Props = {
  rows: WatchHistoryRow[];
  releases: ReleaseDay[];
};

export function CompanionCalendarClient({ rows, releases }: Props) {
  const [tab, setTab] = useState<CalendarTab>("history");
  const [sort, setSort] = useState<ReleaseSort>("anticipated");
  const [filter, setFilter] = useState<ReleaseFilter>("all");

  const filteredReleases = useMemo(() => {
    let list = releases;
    if (filter !== "all") list = list.filter((r) => r.mediaType === filter);
    const next = [...list];
    if (sort === "anticipated") {
      next.sort((a, b) => (b.popularity || 0) - (a.popularity || 0) || a.date.localeCompare(b.date));
    } else if (sort === "rating") {
      next.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0) || a.date.localeCompare(b.date));
    } else {
      next.sort((a, b) => a.date.localeCompare(b.date) || (b.popularity || 0) - (a.popularity || 0));
    }
    return next;
  }, [releases, sort, filter]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex shrink-0 gap-1 rounded-full border border-[var(--mega-border)] bg-white/5 p-1">
          {(
            [
              ["history", "Visionnages"],
              ["releases", "Sorties"],
              ["tonight", "Ce soir"]
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={clsx(
                "rounded-full px-4 py-1.5 text-xs font-bold transition",
                tab === id
                  ? "border border-white/20 bg-white/15 text-[var(--mega-text)]"
                  : "text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "releases" ? (
          <>
            <div className="inline-flex shrink-0 gap-1 rounded-full border border-[var(--mega-border)] bg-white/5 p-1">
              {(
                [
                  ["all", "Tout"],
                  ["movie", "Films"],
                  ["tv", "Séries"]
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={clsx(
                    "rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                    filter === id
                      ? "bg-[var(--brand-gold)] text-[#0c0e12]"
                      : "text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="inline-flex shrink-0 gap-1 rounded-full border border-[var(--mega-border)] bg-white/5 p-1">
              {(
                [
                  ["anticipated", "Plus attendus"],
                  ["date", "Par date"],
                  ["rating", "Mieux notés"]
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSort(id)}
                  className={clsx(
                    "rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                    sort === id
                      ? "bg-[var(--brand-gold)] text-[#0c0e12]"
                      : "text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {tab === "tonight" ? (
        <TonightTvRail />
      ) : (
        <WatchHistoryCalendarView
          rows={rows}
          contentMode={tab}
          releases={filteredReleases}
        />
      )}

      {tab === "releases" ? (
        <p className="text-xs text-[var(--mega-text-faint)]">
          {filteredReleases.length} sorties · fenêtre 60 jours · catalogue TMDB (région FR).
          {filteredReleases.length === 0 ? " Aucun titre pour ce filtre." : null}
        </p>
      ) : null}
      {tab === "tonight" ? (
        <p className="text-xs text-[var(--mega-text-faint)]">
          Guide prime-time des plus grandes chaînes du pays sélectionné (TVMaze) — défilement en boucle.
        </p>
      ) : null}
    </div>
  );
}
