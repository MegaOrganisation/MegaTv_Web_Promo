export type IptvPlaylistEntry = {
  id: string;
  name: string;
  m3uUrl: string;
  epgUrl?: string;
  enabled?: boolean;
};

export type IptvProfileState = {
  m3uUrl?: string;
  epgUrl?: string;
  playlists?: IptvPlaylistEntry[];
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

export function normalizePlaylistEntry(raw: Record<string, unknown>, index: number): IptvPlaylistEntry {
  const id = String(raw.id || `list_${index + 1}`);
  const name = String(raw.name || `Liste ${index + 1}`);
  const m3uUrl = String(raw.m3uUrl || raw.m3u_url || "");
  const epgUrl = String(raw.epgUrl || raw.epg_url || "");
  const enabled = raw.enabled === undefined ? true : Boolean(raw.enabled);
  return { id, name, m3uUrl, epgUrl, enabled };
}

export function newPlaylistId(existing: IptvPlaylistEntry[]) {
  const used = new Set(existing.map((entry) => entry.id));
  let index = existing.length + 1;
  while (used.has(`list_${index}`)) index += 1;
  return `list_${index}`;
}
