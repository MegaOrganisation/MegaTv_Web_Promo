export function formatDuration(seconds: number | null | undefined) {
  const safe = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  if (hours <= 0) return `${minutes} min`;
  return `${hours} h ${minutes.toString().padStart(2, "0")}`;
}

export function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("fr-FR").format(Number(value || 0));
}

export function formatCompact(value: number | null | undefined) {
  return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Aucune activité";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function percent(value: number | null | undefined) {
  return `${Math.round(Math.max(0, Math.min(1, Number(value || 0))) * 100)}%`;
}
