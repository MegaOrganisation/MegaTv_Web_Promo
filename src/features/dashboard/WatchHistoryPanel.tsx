"use client";

import { CalendarDays } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

import { formatDate, formatDuration } from "@/lib/format";
import { tmdbImageUrl, tmdbProxiedImageUrl } from "@/lib/tmdb";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";
import { displayTitle, eventLabel } from "@/features/dashboard/watch-history-utils";
import { WatchHistoryCalendarModal } from "@/features/dashboard/WatchHistoryCalendarModal";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";

type Props = {
  rows: WatchHistoryRow[];
  subtitle?: string;
};

type Filter = "all" | "movie" | "tv";

function dayKey(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return formatDate(iso);
  }
}

function HistoryRowCard({ row }: { row: WatchHistoryRow }) {
  const media = useMediaDetailOptional();
  const poster = tmdbImageUrl(row.poster_path, "w185");
  const posterProxied = tmdbProxiedImageUrl(row.poster_path, "w185");
  const durationLabel = row.watch_seconds > 0 ? formatDuration(row.watch_seconds) : null;
  const layoutId = `media-${row.media_type}-${row.tmdb_id}`;
  const meta =
    row.media_type === "tv" && row.season
      ? `S${row.season} · E${row.episode ?? 1}`
      : row.media_type === "tv"
        ? "Série"
        : "Film";

  function openDetail() {
    if (!row.tmdb_id) return;
    media?.openMediaDetail({
      mediaType: row.media_type,
      tmdbId: row.tmdb_id,
      title: displayTitle(row),
      posterUrl: posterProxied,
      backdropUrl: posterProxied,
      meta,
      layoutId
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 py-2.5 sm:px-4 sm:py-3">
      {poster ? (
        <button
          type="button"
          className="focus-ring shrink-0 overflow-hidden rounded-lg"
          onClick={openDetail}
          aria-label={`Détail ${displayTitle(row)}`}
        >
          <motion.div layoutId={layoutId} className="h-12 w-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" className="h-12 w-8 rounded-lg object-cover transition hover:scale-105" loading="lazy" />
          </motion.div>
        </button>
      ) : (
        <button
          type="button"
          onClick={openDetail}
          className="focus-ring flex h-12 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--mega-border)] text-[10px] text-[var(--mega-text-faint)]"
        >
          {row.media_type === "tv" ? "TV" : "Film"}
        </button>
      )}
      <button type="button" className="min-w-0 flex-1 text-left" onClick={openDetail}>
        <p className="truncate text-sm font-semibold text-[var(--mega-text)]">{displayTitle(row)}</p>
        <p className="mt-0.5 text-xs text-[var(--mega-text-muted)]">
          {formatDate(row.created_at)} · {eventLabel(row.event_type)}
          {durationLabel ? ` · ${durationLabel}` : ""}
          {row.progress != null && row.progress > 0 && row.progress < 0.9
            ? ` · ${Math.round(row.progress * 100)} %`
            : ""}
        </p>
      </button>
    </div>
  );
}

/** F4 — historique groupé par jour + filtre Films/Séries + pills jour. */
export function WatchHistoryPanel({ rows, subtitle }: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.media_type === filter);
  }, [rows, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, WatchHistoryRow[]>();
    for (const row of filtered) {
      const key = dayKey(row.created_at);
      const list = map.get(key) || [];
      list.push(row);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {subtitle ? <p className="text-sm text-[var(--mega-text-muted)]">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-[var(--mega-border)] bg-black/20 p-0.5">
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
                className={`focus-ring rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  filter === id
                    ? "bg-[var(--brand-gold)] text-[#0c0e12]"
                    : "text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
                }`}
              >
                {label}
              </button>
            ))}
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
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--mega-text-faint)]">Aucun visionnage enregistré pour le moment.</p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto overscroll-contain pr-1">
          <div className="space-y-4">
            {groups.map(([day, dayRows]) => (
              <section key={day}>
                <div className="sticky top-0 z-[1] mb-2.5 py-1 backdrop-blur-sm">
                  <h3 className="watch-history-day-pill capitalize">{day}</h3>
                </div>
                <div className="space-y-2">
                  {dayRows.map((row) => (
                    <HistoryRowCard key={row.id} row={row} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      <WatchHistoryCalendarModal open={calendarOpen} rows={rows} onClose={() => setCalendarOpen(false)} />
    </>
  );
}
