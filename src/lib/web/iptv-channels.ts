import { detectPlaylistType, type IptvPlaylistEntry } from "@/lib/iptv/types";

/**
 * Server-side M3U / Xtream channel parsing for the web Live TV viewer.
 *
 * Free Tier + perf rules:
 * - M3U is fetched and parsed on the SERVER (avoids browser CORS, keeps the
 *   provider URL server-side, never touches Supabase egress).
 * - Parsed results are cached in-process per playlist URL with a TTL so
 *   navigating the grid never re-downloads a multi-MB M3U.
 * - Enrichment is capped (like Android ~500 shown / larger tree) so a huge
 *   list can't freeze the client: we cap total parsed channels + returned size.
 */
export type IptvChannel = {
  /** Stable id for favorites: tvg-id when present, else hash(name|url). */
  id: string;
  name: string;
  logo: string | null;
  group: string;
  url: string;
  tvgId: string | null;
  /** Playlist this channel came from (multi-list support). */
  listId: string;
};

export type IptvCategory = {
  id: string;
  label: string;
  count: number;
};

export type IptvChannelsResult = {
  channels: IptvChannel[];
  categories: IptvCategory[];
  epgUrls: string[];
  /** True when the raw list exceeded the parse cap (client should note it). */
  capped: boolean;
  total: number;
  /** Playlists that could not be loaded (bad URL / unsupported / fetch error). */
  errors: { listId: string; name: string; message: string }[];
  /** Signature usable as a client cache key (localStorage). */
  signature: string;
};

const PARSE_CAP = 12000; // hard ceiling on channels kept per refresh
const FETCH_TIMEOUT_MS = 15000;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min: don't re-download M3U on nav
const MAX_BYTES = 40 * 1024 * 1024; // 40 MB safety ceiling for a single M3U

type CacheEntry = { at: number; channels: IptvChannel[]; epgUrl: string | null; capped: boolean };
const cache = new Map<string, CacheEntry>();

function hashString(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

function attr(line: string, name: string): string | null {
  const match = new RegExp(`${name}="([^"]*)"`, "i").exec(line);
  return match ? match[1].trim() || null : null;
}

/** Xtream `player_api`/`get.php` base → an M3U URL we can parse directly. */
function normalizeToM3uUrl(url: string): string {
  const trimmed = url.trim();
  const type = detectPlaylistType(trimmed);
  if (type !== "Xtream") return trimmed;
  try {
    const parsed = new URL(trimmed);
    // player_api.php → get.php with m3u_plus output.
    if (/player_api\.php$/i.test(parsed.pathname)) {
      parsed.pathname = parsed.pathname.replace(/player_api\.php$/i, "get.php");
    }
    if (!parsed.searchParams.get("type")) parsed.searchParams.set("type", "m3u_plus");
    if (!parsed.searchParams.get("output")) parsed.searchParams.set("output", "ts");
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

function parseM3u(text: string, listId: string): { channels: IptvChannel[]; epgUrl: string | null; capped: boolean } {
  const channels: IptvChannel[] = [];
  const seen = new Set<string>();
  let epgUrl: string | null = null;
  let capped = false;

  const lines = text.split(/\r?\n/);
  let pending: { name: string; logo: string | null; group: string; tvgId: string | null } | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTM3U")) {
      epgUrl = epgUrl || attr(line, "url-tvg") || attr(line, "x-tvg-url");
      continue;
    }

    if (line.startsWith("#EXTINF")) {
      const commaIdx = line.lastIndexOf(",");
      const name = (commaIdx >= 0 ? line.slice(commaIdx + 1) : "").trim();
      pending = {
        name: name || attr(line, "tvg-name") || "Sans nom",
        logo: attr(line, "tvg-logo"),
        group: attr(line, "group-title") || "Autres",
        tvgId: attr(line, "tvg-id")
      };
      continue;
    }

    if (line.startsWith("#")) continue; // other directives (EXTVLCOPT, etc.)

    // A URL line closes the pending EXTINF.
    if (pending) {
      const url = line;
      const baseId = pending.tvgId || `${pending.name}|${url}`;
      let id = hashString(baseId);
      // Guard against id collisions across duplicate tvg-ids.
      while (seen.has(id)) id = hashString(`${id}|${channels.length}`);
      seen.add(id);
      channels.push({ id, name: pending.name, logo: pending.logo, group: pending.group, url, tvgId: pending.tvgId, listId });
      pending = null;
      if (channels.length >= PARSE_CAP) {
        capped = true;
        break;
      }
    }
  }

  return { channels, epgUrl, capped };
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "MegaTvWeb/1.0", accept: "*/*" },
      cache: "no-store"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const len = Number(res.headers.get("content-length") || 0);
    if (len && len > MAX_BYTES) throw new Error("Liste trop volumineuse");
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function loadPlaylist(entry: IptvPlaylistEntry): Promise<CacheEntry> {
  const url = normalizeToM3uUrl(entry.m3uUrl);
  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached;

  if (detectPlaylistType(entry.m3uUrl) === "Stalker") {
    throw new Error("Portails Stalker non supportés dans le viewer web (P3).");
  }

  const text = await fetchText(url);
  if (!/#EXTINF/i.test(text)) throw new Error("Format M3U non reconnu.");
  const parsed = parseM3u(text, entry.id);
  const result: CacheEntry = {
    at: Date.now(),
    channels: parsed.channels,
    epgUrl: entry.epgUrl?.trim() || parsed.epgUrl || null,
    capped: parsed.capped
  };
  cache.set(url, result);
  return result;
}

function buildCategories(channels: IptvChannel[]): IptvCategory[] {
  const counts = new Map<string, number>();
  for (const channel of channels) {
    counts.set(channel.group, (counts.get(channel.group) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ id: `grp:${label}`, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

/**
 * Loads and merges all enabled playlists for the profile into a channel list +
 * category tree. Never throws: per-playlist failures are collected in `errors`.
 */
export async function loadIptvChannels(playlists: IptvPlaylistEntry[]): Promise<IptvChannelsResult> {
  const enabled = playlists.filter((entry) => entry.enabled !== false && entry.m3uUrl?.trim());
  const channels: IptvChannel[] = [];
  const epgUrls = new Set<string>();
  const errors: IptvChannelsResult["errors"] = [];
  let capped = false;

  const results = await Promise.allSettled(enabled.map((entry) => loadPlaylist(entry)));
  results.forEach((result, index) => {
    const entry = enabled[index];
    if (result.status === "fulfilled") {
      channels.push(...result.value.channels);
      if (result.value.epgUrl) epgUrls.add(result.value.epgUrl);
      capped = capped || result.value.capped;
    } else {
      const message = result.reason instanceof Error ? result.reason.message : "Chargement impossible";
      errors.push({ listId: entry.id, name: entry.name, message });
    }
  });

  const trimmed = channels.length > PARSE_CAP ? channels.slice(0, PARSE_CAP) : channels;
  if (channels.length > PARSE_CAP) capped = true;

  const signature = hashString(`${trimmed.length}|${enabled.map((e) => e.id + e.m3uUrl).join("|")}`);

  return {
    channels: trimmed,
    categories: buildCategories(trimmed),
    epgUrls: [...epgUrls],
    capped,
    total: trimmed.length,
    errors,
    signature
  };
}
