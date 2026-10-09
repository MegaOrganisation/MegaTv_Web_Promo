export type IptvPlaylistEntry = {
  id: string;
  name: string;
  m3uUrl: string;
  epgUrl?: string;
  enabled?: boolean;
  /** Catégories masquées par playlist (parité Android IptvPlaylistEntry). */
  hiddenCategories?: string[];
  /** Filtre auto langue catégories (ex. "fr") — parité Android categoryLanguageFilter. */
  categoryLanguageFilter?: string | null;
  /** Intervalle refresh par playlist ; null = hérite du global profil. */
  refreshInterval?: string | null;
  includeLive?: boolean | null;
  includeMovies?: boolean | null;
  includeSeries?: boolean | null;
};

export type IptvProfileState = {
  m3uUrl?: string;
  epgUrl?: string;
  playlists?: IptvPlaylistEntry[];
  favoriteChannels?: string[];
  /** Catégories masquées au niveau profil (sync MegaCloud). */
  hiddenCategories?: string[];
  /** Chaînes masquées individuellement (Companion manage — ids stables). */
  hiddenChannels?: string[];
};

export function maskPlaylistUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "—";
  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname.length > 1 ? "/••••" : "";
    return `${parsed.protocol}//${parsed.host}${path}`;
  } catch {
    if (trimmed.length <= 16) return "••••••••";
    return `${trimmed.slice(0, 10)}••••`;
  }
}

export function detectPlaylistType(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes("player_api.php") || lower.includes("get.php")) return "Xtream";
  if (lower.includes("stalker") || lower.includes("portal.php")) return "Stalker";
  return "M3U";
}

function optionalString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  return value ? value : null;
}

export function cleanUrl(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  const trimmed = String(raw).trim();
  if (trimmed === "null" || trimmed === "undefined") return "";
  return trimmed;
}

export function normalizePlaylistEntry(raw: Record<string, unknown>, index: number): IptvPlaylistEntry {
  const id = String(raw.id || `list_${index + 1}`);
  const name = String(raw.name || `Liste ${index + 1}`);
  // Android / Companion may use m3uUrl; tolerate url / sourceUrl aliases.
  const rawUrl = raw.m3uUrl ?? raw.m3u_url ?? raw.url ?? raw.sourceUrl ?? "";
  const m3uUrl = cleanUrl(rawUrl);
  const rawEpg = raw.epgUrl ?? raw.epg_url ?? "";
  const epgUrl = cleanUrl(rawEpg);
  const enabled = raw.enabled === undefined ? true : Boolean(raw.enabled);
  const hiddenRaw = raw.hiddenCategories ?? raw.hidden_categories;
  const hiddenCategories = Array.isArray(hiddenRaw)
    ? [...new Set(hiddenRaw.map((v) => String(v || "").trim()).filter(Boolean))]
    : [];
  const categoryLanguageFilter = optionalString(
    raw.categoryLanguageFilter ?? raw.category_language_filter,
  );
  const refreshInterval = optionalString(raw.refreshInterval ?? raw.refresh_interval);
  return {
    id,
    name,
    m3uUrl,
    epgUrl,
    enabled,
    hiddenCategories,
    categoryLanguageFilter,
    refreshInterval,
    includeLive: typeof raw.includeLive === "boolean" ? raw.includeLive : null,
    includeMovies: typeof raw.includeMovies === "boolean" ? raw.includeMovies : null,
    includeSeries: typeof raw.includeSeries === "boolean" ? raw.includeSeries : null,
  };
}

export function newPlaylistId(existing: IptvPlaylistEntry[]) {
  const used = new Set(existing.map((entry) => entry.id));
  let index = existing.length + 1;
  while (used.has(`list_${index}`)) index += 1;
  return `list_${index}`;
}
