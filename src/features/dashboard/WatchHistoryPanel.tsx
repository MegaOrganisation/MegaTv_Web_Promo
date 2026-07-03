"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { formatDate, formatDuration } from "@/lib/format";
import { tmdbImageUrl } from "@/lib/tmdb";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";
import { displayTitle, eventLabel } from "@/features/dashboard/watch-history-utils";
import { WatchHistoryCalendarModal } from "@/features/dashboard/WatchHistoryCalendarModal";

type Props = {
  rows: WatchHistoryRow[];
  subtitle?: string;
};

export function WatchHistoryPanel({ rows, subtitle }: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {subtitle ? <p className="text-sm text-[var(--mega-text-muted)]">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 py-2 text-xs font-semibold text-[var(--mega-text-muted)] transition hover:text-[var(--mega-text)]"
          aria-label="Ouvrir le calendrier des visionnages"
        >
          <CalendarDays className="h-4 w-4" />
          Calendrier
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--mega-text-faint)]">Aucun visionnage enregistré pour le moment.</p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto overscroll-contain pr-1">
          <div className="space-y-2">
            {rows.map((row) => {
              const poster = tmdbImageUrl(row.poster_path, "w185");
              const durationLabel = row.watch_seconds > 0 ? formatDuration(row.watch_seconds) : null;

              return (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-4 py-3"
                >
                  {poster ? (
                    <img src={poster} alt="" className="h-12 w-8 shrink-0 rounded-lg object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--mega-border)] text-[10px] text-[var(--mega-text-faint)]">
                      {row.media_type === "tv" ? "TV" : "Film"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--mega-text)]">{displayTitle(row)}</p>
                    <p className="mt-1 text-xs text-[var(--mega-text-muted)]">
                      {formatDate(row.created_at)} · {eventLabel(row.event_type)}
                      {durationLabel ? ` · ${durationLabel}` : ""}
                      {row.progress != null && row.progress > 0 && row.progress < 0.9
                        ? ` · ${Math.round(row.progress * 100)} %`
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <WatchHistoryCalendarModal open={calendarOpen} rows={rows} onClose={() => setCalendarOpen(false)} />
    </>
  );
}
