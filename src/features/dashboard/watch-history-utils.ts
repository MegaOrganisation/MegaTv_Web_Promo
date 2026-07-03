import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";

export type CalendarViewMode = "day" | "week" | "month" | "year";

const EVENT_LABELS: Record<string, string> = {
  completed: "Terminé",
  progress: "En cours",
  watched: "Marqué vu",
  web: "Web"
};

export function eventLabel(eventType: string) {
  return EVENT_LABELS[eventType] || eventType;
}

export function displayTitle(row: WatchHistoryRow) {
  if (row.title?.trim()) {
    if (row.media_type === "tv" && row.season && row.episode) {
      const ep = row.episode_title?.trim() ? ` — ${row.episode_title}` : "";
      return `${row.title} · S${row.season}E${row.episode}${ep}`;
    }
    return row.title;
  }
  if (row.media_type === "tv") {
    return `Série TMDB ${row.tmdb_id}${row.season && row.episode ? ` · S${row.season}E${row.episode}` : ""}`;
  }
  return `Film TMDB ${row.tmdb_id}`;
}

export function contentKey(row: WatchHistoryRow) {
  if (row.media_type === "tv") return `tv:${row.tmdb_id}:${row.season ?? 0}:${row.episode ?? 0}`;
  return `movie:${row.tmdb_id}`;
}

export function parseWatchDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(next, diff);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

export function groupRowsByDate(rows: WatchHistoryRow[]) {
  const map = new Map<string, WatchHistoryRow[]>();
  for (const row of rows) {
    const parsed = parseWatchDate(row.created_at);
    if (!parsed) continue;
    const key = dateKey(parsed);
    const bucket = map.get(key) || [];
    bucket.push(row);
    map.set(key, bucket);
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) => parseWatchDate(b.created_at)!.getTime() - parseWatchDate(a.created_at)!.getTime());
  }
  return map;
}

export function uniqueRowsForPills(rows: WatchHistoryRow[]) {
  const seen = new Set<string>();
  const unique: WatchHistoryRow[] = [];
  for (const row of rows) {
    const key = contentKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

export function formatPeriodLabel(mode: CalendarViewMode, anchor: Date) {
  if (mode === "day") {
    return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(anchor);
  }
  if (mode === "week") {
    const start = startOfWeek(anchor);
    const end = addDays(start, 6);
    const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
    return `Semaine du ${fmt.format(start)} au ${fmt.format(end)} ${end.getFullYear()}`;
  }
  if (mode === "month") {
    return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(anchor);
  }
  return String(anchor.getFullYear());
}

export function shiftAnchor(mode: CalendarViewMode, anchor: Date, delta: number) {
  if (mode === "day") return addDays(anchor, delta);
  if (mode === "week") return addDays(anchor, delta * 7);
  if (mode === "month") return addMonths(anchor, delta);
  return addYears(anchor, delta);
}
