"use client";

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { MobileModalOverlay } from "@/components/ui/MobileModalOverlay";

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

type Props = {
  open: boolean;
  rows: WatchHistoryRow[];
  onClose: () => void;
};

const VIEW_MODES: { id: CalendarViewMode; label: string }[] = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" }
];

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function PosterPillStack({
  rows,
  max = 4,
  size = "md"
}: {
  rows: WatchHistoryRow[];
  max?: number;
  size?: "sm" | "md" | "lg";
}) {
  const unique = uniqueRowsForPills(rows);
  const visible = unique.slice(0, max);
  const extra = unique.length - visible.length;
  const dim = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8";

  if (visible.length === 0) return null;

  return (
    <div className="flex items-center">
      {visible.map((row, index) => {
        const poster = tmdbImageUrl(row.poster_path, "w185");
        return (
          <div
            key={`${row.id}-${index}`}
            className={clsx(
              "shrink-0 overflow-hidden rounded-full border-2 border-[var(--mega-card-bg)] bg-[var(--mega-border)] shadow-sm",
              dim,
              index > 0 && "-ml-2.5"
            )}
            style={{ zIndex: visible.length - index }}
            title={displayTitle(row)}
          >
            {poster ? (
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

export function WatchHistoryCalendarModal({ open, rows, onClose }: Props) {
  const [mode, setMode] = useState<CalendarViewMode>("month");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));

  const byDate = useMemo(() => groupRowsByDate(rows), [rows]);

  useEffect(() => {
    if (!open) return;
    const latest = rows[0]?.created_at;
    if (latest) {
      const parsed = new Date(latest);
      if (Number.isFinite(parsed.getTime())) setAnchor(startOfDay(parsed));
    }
  }, [open, rows]);

  if (!open) return null;

  const periodLabel = formatPeriodLabel(mode, anchor);

  function rowsForDay(day: Date) {
    return byDate.get(dateKey(day)) || [];
  }

  function renderDayView() {
    const dayRows = rowsForDay(anchor);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--mega-text)]">{dayRows.length} visionnage(s)</p>
            <p className="text-xs text-[var(--mega-text-muted)]">
              {formatDuration(dayRows.reduce((sum, row) => sum + row.watch_seconds, 0))} cumulés
            </p>
          </div>
          <PosterPillStack rows={dayRows} max={6} size="lg" />
        </div>
        <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
          {dayRows.length === 0 ? (
            <p className="text-sm text-[var(--mega-text-faint)]">Aucun visionnage ce jour-là.</p>
          ) : (
            dayRows.map((row) => (
              <div key={row.id} className="flex items-center gap-3 rounded-xl border border-[var(--mega-border)] px-3 py-2">
                <PosterPillStack rows={[row]} max={1} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--mega-text)]">{displayTitle(row)}</p>
                  <p className="text-xs text-[var(--mega-text-muted)]">
                    {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(row.created_at))}
                    {row.watch_seconds > 0 ? ` · ${formatDuration(row.watch_seconds)}` : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  function renderWeekView() {
    const start = startOfWeek(anchor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => {
          const dayRows = rowsForDay(day);
          const isToday = dateKey(day) === dateKey(new Date());
          const isSelected = dateKey(day) === dateKey(anchor);
          return (
            <button
              key={dateKey(day)}
              type="button"
              onClick={() => {
                setAnchor(startOfDay(day));
                setMode("day");
              }}
              className={clsx(
                "flex min-h-[120px] flex-col rounded-2xl border p-3 text-left transition",
                isSelected ? "border-[var(--mega-accent)] bg-[var(--mega-card-bg)]" : "border-[var(--mega-border)] bg-[var(--mega-card-bg)]/60 hover:bg-[var(--mega-card-bg)]",
                isToday && "ring-1 ring-[var(--mega-accent)]/40"
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase text-[var(--mega-text-muted)]">
                  {WEEKDAY_LABELS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                </span>
                <span className="text-sm font-bold text-[var(--mega-text)]">{day.getDate()}</span>
              </div>
              <PosterPillStack rows={dayRows} max={5} size="sm" />
              {dayRows.length > 0 ? (
                <p className="mt-auto pt-2 text-[10px] text-[var(--mega-text-faint)]">{dayRows.length} evt.</p>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  function renderMonthView() {
    const monthStart = startOfMonth(anchor);
    const gridStart = startOfWeek(monthStart);
    const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

    return (
      <div>
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-1 py-1 text-center text-[10px] font-semibold uppercase text-[var(--mega-text-faint)]">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day) => {
            const dayRows = rowsForDay(day);
            const inMonth = day.getMonth() === anchor.getMonth();
            const isToday = dateKey(day) === dateKey(new Date());
            return (
              <button
                key={dateKey(day)}
                type="button"
                onClick={() => {
                  setAnchor(startOfDay(day));
                  setMode("day");
                }}
                className={clsx(
                  "flex min-h-[88px] flex-col rounded-xl border p-1.5 text-left transition sm:min-h-[96px]",
                  inMonth ? "border-[var(--mega-border)] bg-[var(--mega-card-bg)]/70" : "border-transparent bg-transparent opacity-40",
                  isToday && "ring-1 ring-[var(--mega-accent)]/50",
                  dayRows.length > 0 && inMonth && "hover:bg-[var(--mega-card-bg)]"
                )}
              >
                <span className={clsx("text-xs font-semibold", inMonth ? "text-[var(--mega-text)]" : "text-[var(--mega-text-faint)]")}>
                  {day.getDate()}
                </span>
                <div className="mt-1 flex-1">
                  <PosterPillStack rows={dayRows} max={3} size="sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderYearView() {
    const year = anchor.getFullYear();

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MONTH_LABELS.map((label, monthIndex) => {
          const monthRows: WatchHistoryRow[] = [];
          for (const [key, bucket] of byDate.entries()) {
            const [y, m] = key.split("-").map(Number);
            if (y === year && m === monthIndex + 1) monthRows.push(...bucket);
          }
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                setAnchor(new Date(year, monthIndex, 1));
                setMode("month");
              }}
              className="flex min-h-[110px] flex-col rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/70 p-3 text-left transition hover:bg-[var(--mega-card-bg)]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--mega-text)]">{label}</span>
                {monthRows.length > 0 ? (
                  <span className="text-[10px] text-[var(--mega-text-faint)]">{monthRows.length}</span>
                ) : null}
              </div>
              <PosterPillStack rows={monthRows} max={6} size="sm" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <MobileModalOverlay open={open} onClose={onClose}>
      <div
        className="mega-glass mega-lg-modal flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[var(--mega-border)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--mega-border)] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 id="watch-history-calendar-title" className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">
              Calendrier des visionnages
            </h2>
            <p className="mt-1 text-xs text-[var(--mega-text-muted)] sm:text-sm">Pochettes superposées par période — cliquez un jour pour le détail.</p>
          </div>
          <button type="button" onClick={onClose} className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--mega-border)] px-4 py-3 sm:px-5">
          {VIEW_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={clsx(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                mode === item.id
                  ? "bg-[var(--mega-accent)] text-white"
                  : "bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--mega-border)] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setAnchor((current) => shiftAnchor(mode, current, -1))}
            className="focus-ring rounded-full p-2 text-[var(--mega-text-muted)] hover:bg-[var(--mega-card-bg)]"
            aria-label="Période précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-center text-sm font-semibold capitalize text-[var(--mega-text)]">{periodLabel}</p>
          <button
            type="button"
            onClick={() => setAnchor((current) => shiftAnchor(mode, current, 1))}
            className="focus-ring rounded-full p-2 text-[var(--mega-text-muted)] hover:bg-[var(--mega-card-bg)]"
            aria-label="Période suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {mode === "day" ? renderDayView() : null}
          {mode === "week" ? renderWeekView() : null}
          {mode === "month" ? renderMonthView() : null}
          {mode === "year" ? renderYearView() : null}
        </div>
      </div>
    </MobileModalOverlay>
  );
}
