/** Parity with Android `getPlaybackTimeLabels` / `parseDurationToMinutes`. */
export type PlaybackTimeInfo = {
  elapsedLabel: string;
  remainingLabel: string;
  totalLabel: string;
};

export function formatMins(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

export function formatResumeClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function getContinueProgressFraction(item: {
  progress?: number | null;
  progressSeconds?: number | null;
  totalDurationSeconds?: number | null;
}): number {
  if (
    typeof item.progressSeconds === "number" &&
    typeof item.totalDurationSeconds === "number" &&
    item.totalDurationSeconds > 0
  ) {
    return Math.min(1, Math.max(0, item.progressSeconds / item.totalDurationSeconds));
  }
  const raw = item.progress ?? 0;
  if (raw <= 0) return 0;
  return raw <= 1 ? Math.min(1, raw) : Math.min(1, raw / 100);
}

export function getPlaybackTimeLabels(
  item: {
    progress?: number | null;
    progressSeconds?: number | null;
    totalDurationSeconds?: number | null;
    timeRemainingLabel?: string | null;
  },
  progressFraction: number
): PlaybackTimeInfo {
  const progress = Math.min(1, Math.max(0, progressFraction));
  const progressInt = Math.round(progress * 100);

  const durationMinutes =
    typeof item.totalDurationSeconds === "number" && item.totalDurationSeconds > 0
      ? Math.round(item.totalDurationSeconds / 60)
      : 0;

  if (durationMinutes > 0) {
    const elapsedMinutes = Math.min(durationMinutes, Math.round(durationMinutes * progress));
    const remainingMinutes = Math.max(0, durationMinutes - elapsedMinutes);
    const elapsed = formatMins(elapsedMinutes);
    const remaining =
      remainingMinutes >= 60
        ? `${Math.floor(remainingMinutes / 60)}h${remainingMinutes % 60 > 0 ? ` ${remainingMinutes % 60}m` : ""} remaining`
        : `${remainingMinutes} remaining`;
    return { elapsedLabel: elapsed, remainingLabel: remaining, totalLabel: formatMins(durationMinutes) };
  }

  if (typeof item.progressSeconds === "number" && item.progressSeconds > 0 && progress > 0 && progress < 1) {
    const elapsedMinutes = Math.round((item.progressSeconds / 60) * 10) / 10;
    const totalMinutes = Math.max(1, Math.round(elapsedMinutes / progress));
    const remainingMinutes = Math.max(0, totalMinutes - Math.floor(elapsedMinutes));
    const elapsed = formatMins(Math.floor(elapsedMinutes));
    const remaining =
      remainingMinutes >= 60
        ? `${Math.floor(remainingMinutes / 60)}h remaining`
        : `${remainingMinutes} remaining`;
    return { elapsedLabel: elapsed, remainingLabel: remaining, totalLabel: formatMins(totalMinutes) };
  }

  const remainingLabelRaw = item.timeRemainingLabel?.trim() || "";
  if (remainingLabelRaw) {
    let remainingMinutes = 0;
    const hourMatch = /(\d+)\s*(?:hr|h)/i.exec(remainingLabelRaw);
    const minMatch = /(\d+)\s*(?:min|m)(?!\w)/i.exec(remainingLabelRaw);
    if (hourMatch) remainingMinutes += Number(hourMatch[1]) * 60;
    if (minMatch) remainingMinutes += Number(minMatch[1]);

    if (remainingMinutes > 0 && progress > 0 && progress < 1) {
      const totalMinutes = Math.max(1, Math.round(remainingMinutes / (1 - progress)));
      const elapsedMinutes = Math.min(totalMinutes, Math.round(totalMinutes * progress));
      const elapsed = formatMins(elapsedMinutes);
      const remaining =
        remainingMinutes >= 60
          ? `${Math.floor(remainingMinutes / 60)}h remaining`
          : `${remainingMinutes} remaining`;
      return { elapsedLabel: elapsed, remainingLabel: remaining, totalLabel: formatMins(totalMinutes) };
    }
    return { elapsedLabel: `${progressInt}%`, remainingLabel: remainingLabelRaw, totalLabel: "" };
  }

  return { elapsedLabel: `${progressInt}%`, remainingLabel: "", totalLabel: "" };
}
