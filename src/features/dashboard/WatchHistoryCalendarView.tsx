"use client";

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";

import { formatDuration } from "@/lib/format";
import { tmdbImageUrl } from "@/lib/tmdb";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";
import {
  addDays,
  CalendarViewMode,
  dateKey,
  displayTitle,
  formatPeriodLabel,
  groupRowsByDate,
  shiftAnchor,
  startOfDay,
  startOfMonth,
  startOfWeek,
  uniqueRowsForPills
} from "@/features/dashboard/watch-history-utils";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { CalendarDayDetailModal } from "@/features/dashboard/CalendarDayDetailModal";

const VIEW_MODES: { id: CalendarViewMode; label: string }[] = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" }
];

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

/** Heatmap multicolore — opacité ↑ avec le volume de visionnages/sorties. */
function heatStyle(count: number, maxCount: number): { className: string; style?: CSSProperties } {
  if (count <= 0 || maxCount <= 0) {
    return { className: "cal-heat cal-heat--empty" };
  }
  const t = Math.min(1, count / Math.max(1, maxCount));
  // bleu → teal → gold → magenta selon intensité
  const stops = [
    [63, 154, 230],
    [31, 168, 160],
    [242, 180, 60],
    [216, 73, 127]
  ];
  const idx = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const local = t * (stops.length - 1) - idx;
  const a = stops[idx];
  const b = stops[idx + 1];
  const rgb = a.map((v, i) => Math.round(v + (b[i] - v) * local));
  const alpha = 0.12 + t * 0.72;
  return {
    className: "cal-heat",
    style: {
      background: `linear-gradient(155deg, rgba(${rgb.join(",")},${alpha}) 0%, rgba(12,14,18,${0.35 + t * 0.25}) 100%)`,
      boxShadow: `inset 0 0 0 1px rgba(${rgb.join(",")},${0.15 + t * 0.35})`
    }
  };
}

function PosterPillStack({
  rows,
  max = 4,
  size = "md"
}: {
  rows: WatchHistoryRow[];
  max?: number;
  size?: "sm" | "md" | "lg";
}) {
  const media = useMediaDetailOptional();
  const unique = uniqueRowsForPills(rows);
  const visible = unique.slice(0, max);
  const extra = unique.length - visible.length;
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";

  if (visible.length === 0) return null;

  return (
    <div className="flex items-center">
      {visible.map((row, index) => {
        const poster = tmdbImageUrl(row.poster_path, "w185");
        const canOpen = Number.isFinite(row.tmdb_id) && row.tmdb_id > 0;
        // div + role (pas <button>) : les cellules jour/mois sont déjà des <button>
        return (
          <div
            key={`${row.id}-${index}`}
            role={canOpen ? "button" : undefined}
            tabIndex={canOpen ? 0 : undefined}
            className={clsx(
              "shrink-0 overflow-hidden rounded-full border-2 border-[var(--mega-card-bg)] bg-[var(--mega-border)] shadow-sm transition hover:scale-110 focus-ring",
              dim,
              index > 0 && "-ml-3",
              canOpen ? "cursor-pointer" : "cursor-default opacity-80"
            )}
            style={{ zIndex: visible.length - index }}
            title={displayTitle(row)}
            aria-label={canOpen ? `Détail ${displayTitle(row)}` : displayTitle(row)}
            onClick={(e) => {
              e.stopPropagation();
              if (!canOpen) return;
              media?.openMediaDetail({
                mediaType: row.media_type,
                tmdbId: row.tmdb_id,
                title: displayTitle(row),
                posterUrl: poster,
                meta:
                  row.media_type === "tv" && row.season
                    ? `S${row.season} · E${row.episode ?? 1}`
                    : row.media_type === "tv"
                      ? "Série"
                      : "Film",
                layoutId: `cal-${row.media_type}-${row.tmdb_id}-${row.id}`
              });
            }}
            onKeyDown={(e) => {
              if (!canOpen) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                (e.currentTarget as HTMLElement).click();
              }
            }}
          >
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[var(--mega-text-faint)]">
                {row.media_type === "tv" ? "TV" : "F"}
              </div>
            )}
          </div>
        );
      })}
      {extra > 0 ? (
        <span className="ml-1 rounded-full bg-[var(--mega-card-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--mega-text-muted)]">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

export type CalendarContentMode = "history" | "releases";

export type ReleaseDay = {
  date: string;
  title: string;
  mediaType: "movie" | "tv";
  posterPath?: string | null;
  tmdbId?: number | null;
  popularity?: number;
  voteAverage?: number;
};

type Props = {
  rows: WatchHistoryRow[];
  contentMode: CalendarContentMode;
  releases?: ReleaseDay[];
  compact?: boolean;
};

/** Grille calendrier réutilisable — visionnages ou sorties (même chrome). */
export function WatchHistoryCalendarView({ rows, contentMode, releases = [], compact = false }: Props) {
  const [mode, setMode] = useState<CalendarViewMode>("month");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [dayModal, setDayModal] = useState<{ key: string; label: string; rows: WatchHistoryRow[] } | null>(null);

  function openDayModal(day: Date, dayRows: WatchHistoryRow[]) {
    const label = day.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    setDayModal({ key: dateKey(day), label, rows: dayRows });
  }

  const byDate = useMemo(() => {
    if (contentMode === "history") return groupRowsByDate(rows);
    const map = new Map<string, WatchHistoryRow[]>();
    for (const r of releases) {
      const key = r.date.slice(0, 10);
      const synthetic: WatchHistoryRow = {
        id: `rel-${key}-${r.tmdbId ?? r.title}`,
        profile_id: null,
        media_type: r.mediaType,
        tmdb_id: r.tmdbId && r.tmdbId > 0 ? r.tmdbId : 0,
        title: r.title,
        poster_path: r.posterPath ?? null,
        created_at: `${key}T12:00:00.000Z`,
        watch_seconds: 0,
        progress: null,
        season: null,
        episode: null,
        episode_title: null,
        event_type: "release"
      };
      const list = map.get(key) ?? [];
      list.push(synthetic);
      map.set(key, list);
    }
    return map;
  }, [contentMode, rows, releases]);

  const periodLabel = formatPeriodLabel(mode, anchor);
  const maxDayCount = useMemo(() => {
    let max = 0;
    for (const list of byDate.values()) max = Math.max(max, list.length);
    return max;
  }, [byDate]);

  function rowsForDay(day: Date) {
    return byDate.get(dateKey(day)) ?? [];
  }

  function go(delta: number) {
    setAnchor((prev) => shiftAnchor(mode, prev, delta));
  }

  function DayPane({ dayRows, emptyLabel }: { dayRows: WatchHistoryRow[]; emptyLabel: string }) {
    if (dayRows.length === 0) {
      return <p className="text-sm text-[var(--mega-text-muted)]">{emptyLabel}</p>;
    }
    return (
      <div className="space-y-3">
        <PosterPillStack rows={dayRows} max={6} size="lg" />
        <ul className="space-y-2">
          {dayRows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/40 px-3 py-2"
            >
              <PosterPillStack rows={[row]} max={1} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--mega-text)]">{displayTitle(row)}</p>
                <p className="text-[11px] text-[var(--mega-text-muted)]">
                  {row.event_type === "release"
                    ? "Sortie"
                    : row.watch_seconds
                      ? formatDuration(row.watch_seconds)
                      : row.media_type === "tv"
                        ? "Série"
                        : "Film"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const weekStart = startOfWeek(anchor);
  const monthStart = startOfMonth(anchor);
  const monthGridStart = startOfWeek(monthStart);

  return (
    <div className={clsx("companion-calendar-view flex min-h-0 flex-1 flex-col gap-3", compact && "text-sm")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" className="focus-ring rounded-full border border-[var(--mega-border)] p-1.5" onClick={() => go(-1)} aria-label="Période précédente">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-[9rem] text-center text-sm font-bold text-[var(--mega-text)]">{periodLabel}</p>
          <button type="button" className="focus-ring rounded-full border border-[var(--mega-border)] p-1.5" onClick={() => go(1)} aria-label="Période suivante">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="inline-flex gap-1 rounded-full border border-[var(--mega-border)] bg-white/5 p-1">
          {VIEW_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={clsx(
                "rounded-full px-3 py-1 text-[11px] font-bold transition",
                mode === item.id
                  ? "border border-white/20 bg-white/15 text-[var(--mega-text)]"
                  : "text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "day" ? (
        <DayPane
          dayRows={rowsForDay(anchor)}
          emptyLabel={contentMode === "releases" ? "Aucune sortie ce jour." : "Aucun visionnage ce jour-là."}
        />
      ) : null}

      {mode === "week" ? (
        <div className="grid grid-cols-7 gap-1.5 overflow-hidden">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--mega-text-faint)]">
              {label}
            </div>
          ))}
          {Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekStart, i);
            const dayRows = rowsForDay(day);
            const heat = heatStyle(dayRows.length, maxDayCount);
            return (
              <button
                type="button"
                key={dateKey(day)}
                onClick={() => openDayModal(day, dayRows)}
                className={clsx(
                  "cal-day-cell min-h-[5.5rem] overflow-hidden rounded-2xl border border-[var(--mega-border)] p-1.5 text-left focus-ring",
                  heat.className
                )}
                style={heat.style}
              >
                <div className="mb-1 flex items-center justify-between gap-1">
                  <p className="text-[11px] font-bold text-[var(--mega-text-muted)]">{day.getDate()}</p>
                  {dayRows.length > 0 ? <span className="cal-heat__count">{dayRows.length}</span> : null}
                </div>
                <PosterPillStack rows={dayRows} max={5} size="md" />
              </button>
            );
          })}
        </div>
      ) : null}

      {mode === "month" ? (
        <div className="grid grid-cols-7 gap-1.5 overflow-hidden">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--mega-text-faint)]">
              {label}
            </div>
          ))}
          {Array.from({ length: 42 }, (_, i) => {
            const day = addDays(monthGridStart, i);
            const inMonth = day.getMonth() === anchor.getMonth();
            const dayRows = rowsForDay(day);
            const heat = heatStyle(inMonth ? dayRows.length : 0, maxDayCount);
            return (
              <button
                type="button"
                key={dateKey(day)}
                disabled={!inMonth}
                onClick={() => inMonth && openDayModal(day, dayRows)}
                className={clsx(
                  "cal-day-cell min-h-[4.75rem] overflow-hidden rounded-xl border p-1 text-left focus-ring",
                  heat.className,
                  !inMonth && "cursor-default opacity-35"
                )}
                style={inMonth ? heat.style : undefined}
              >
                <div className="mb-1 flex items-center justify-between gap-1">
                  <p className="text-[10px] font-bold text-[var(--mega-text-muted)]">{day.getDate()}</p>
                  {inMonth && dayRows.length > 0 ? <span className="cal-heat__count">{dayRows.length}</span> : null}
                </div>
                {inMonth ? <PosterPillStack rows={dayRows} max={3} size="md" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {mode === "year" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {MONTH_LABELS.map((label, monthIndex) => {
            const monthRows = Array.from(byDate.entries())
              .filter(([key]) => {
                const d = new Date(`${key}T12:00:00`);
                return d.getFullYear() === anchor.getFullYear() && d.getMonth() === monthIndex;
              })
              .flatMap(([, list]) => list);
            const heat = heatStyle(monthRows.length, Math.max(maxDayCount * 4, 1));
            return (
              <div
                key={label}
                className={clsx("overflow-hidden rounded-2xl border border-[var(--mega-border)] p-2.5", heat.className)}
                style={heat.style}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--mega-text)]">{label}</p>
                  {monthRows.length > 0 ? <span className="cal-heat__count">{monthRows.length}</span> : null}
                </div>
                <PosterPillStack rows={monthRows} max={6} size="md" />
              </div>
            );
          })}
        </div>
      ) : null}

      <CalendarDayDetailModal
        open={Boolean(dayModal)}
        dateLabel={dayModal?.label || ""}
        rows={dayModal?.rows || []}
        modeLabel={contentMode === "releases" ? "Sorties" : "Visionnages"}
        onClose={() => setDayModal(null)}
      />
    </div>
  );
}
