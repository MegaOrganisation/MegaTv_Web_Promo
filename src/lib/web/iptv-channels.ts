import { createHash } from "node:crypto";

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
 *
 * Channel ids MUST match Android `IptvRepository.buildChannelId` + playlist
 * prefix (`listId:m3u:…`) so Companion favorites sync into Mobile/TV Live TV.
 */
export type IptvChannel = {
  /** Android-compatible id: `{listId}:m3u:{epg?}:{streamKey}`. */
  id: string;
  /**
   * Legacy web hash id (pre-Android alignment). Used only to remap localStorage
   * / cloud favorites that still store short hashes like `1gpu1x8`.
   */
  legacyId: string;
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
// Many Xtream panels 4xx/884 non-player user-agents. Presenting as VLC keeps the
// server-side listing calls (player_api.php) and stream URLs accepted.
const IPTV_UA = "VLC/3.0.20 LibVLC/3.0.20";

type CacheEntry = { at: number; channels: IptvChannel[]; epgUrl: string | null; capped: boolean };
const cache = new Map<string, CacheEntry>();

function hashString(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

/** Mirrors Android `normalizeChannelKey`. */
function normalizeChannelKey(value: string): string {
  return value.trim().toLowerCase();
}

/** Mirrors Android `stableStreamKey` / `sha1Hex`. */
function stableStreamKey(streamUrl: string): string {
  const normalized = streamUrl.trim();
  if (!normalized) return "empty";
  const digest = createHash("sha1").update(normalized, "utf8").digest("hex").slice(0, 16);
  return `${normalized.length}-${digest}`;
}

/**
 * Mirrors Android `buildChannelId` then prefixes `playlistId:` like
 * `fetchChannelsForPlaylistWithRetries`.
 */
export function buildAndroidChannelId(listId: string, streamUrl: string, epgId: string | null | undefined): string {
  const normalizedEpg = normalizeChannelKey(epgId || "");
  const streamKey = stableStreamKey(streamUrl);
  const base = normalizedEpg ? `m3u:${normalizedEpg}:${streamKey}` : `m3u:${streamKey}`;
  const prefix = (listId || "list_1").trim() || "list_1";
  return `${prefix}:${base}`;
}

/** Legacy web favorite id — keep generating so old cloud/local favorites can remap. */
export function buildLegacyChannelId(tvgId: string | null | undefined, name: string, urlOrStreamId: string): string {
  return hashString(tvgId || `${name}|${urlOrStreamId}`);
}

/** Default group label aligned with Android M3U parser (`Uncategorized`). */
function defaultGroupLabel(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed || /^autres$/i.test(trimmed)) return "Uncategorized";
  return trimmed;
}

/**
 * Remaps stored favorite ids (legacy web hashes or bare m3u ids) onto current
 * Android-compatible channel ids. Returns null when nothing changed.
 */
export function remapFavoriteChannelIds(
  favoriteIds: string[],
  channels: Pick<IptvChannel, "id" | "legacyId">[]
): string[] | null {
  if (favoriteIds.length === 0 || channels.length === 0) return null;

  const byId = new Map<string, string>();
  const byLegacy = new Map<string, string>();
  for (const ch of channels) {
    byId.set(ch.id, ch.id);
    if (ch.legacyId) byLegacy.set(ch.legacyId, ch.id);
    // Also accept bare Android id without playlist prefix.
    const colon = ch.id.indexOf(":");
    if (colon > 0) {
      const bare = ch.id.slice(colon + 1);
      if (!byId.has(bare)) byId.set(bare, ch.id);
    }
  }

  let changed = false;
  const next: string[] = [];
  const seen = new Set<string>();
  for (const raw of favoriteIds) {
    const mapped = byId.get(raw) || byLegacy.get(raw) || raw;
    if (mapped !== raw) changed = true;
    if (seen.has(mapped)) {
      changed = true;
      continue;
    }
    seen.add(mapped);
    next.push(mapped);
  }

  return changed ? next : null;
}

/** Normalize tvg-logo / stream_icon URLs (protocol-relative, relative to playlist host). */
export function normalizeIptvLogoUrl(raw: string | null | undefined, baseUrl?: string | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (baseUrl) return new URL(trimmed, baseUrl).toString();
    return trimmed;
  } catch {
    return null;
  }
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

function parseM3u(text: string, listId: string, logoBase?: string | null): { channels: IptvChannel[]; epgUrl: string | null; capped: boolean } {
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
        group: defaultGroupLabel(attr(line, "group-title")),
        tvgId: attr(line, "tvg-id")
      };
      continue;
    }

    if (line.startsWith("#")) continue; // other directives (EXTVLCOPT, etc.)

    // A URL line closes the pending EXTINF.
    if (pending) {
      const url = line;
      let legacyId = buildLegacyChannelId(pending.tvgId, pending.name, url);
      while (seen.has(`legacy:${legacyId}`)) {
        legacyId = hashString(`${legacyId}|${channels.length}`);
      }
      seen.add(`legacy:${legacyId}`);

      let id = buildAndroidChannelId(listId, url, pending.tvgId);
      // Guard against rare collisions across duplicate streams.
      while (seen.has(id)) id = `${id}~${channels.length}`;
      seen.add(id);

      channels.push({
        id,
        legacyId,
        name: pending.name,
        logo: normalizeIptvLogoUrl(pending.logo, logoBase),
        group: pending.group,
        url,
        tvgId: pending.tvgId,
        listId
      });
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
      headers: { "user-agent": IPTV_UA, accept: "*/*" },
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

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": IPTV_UA, accept: "application/json,*/*" },
      cache: "no-store"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

type XtreamCreds = { base: string; username: string; password: string };

/** Extract base URL + credentials from an Xtream `get.php`/`player_api.php` URL. */
function parseXtreamCreds(rawUrl: string): XtreamCreds | null {
  try {
    const u = new URL(rawUrl.trim());
    const username = u.searchParams.get("username");
    const password = u.searchParams.get("password");
    if (!username || !password) return null;
    return { base: `${u.protocol}//${u.host}`, username, password };
  } catch {
    return null;
  }
}

type XtreamCategory = { category_id?: string | number; category_name?: string };
type XtreamLiveStream = {
  stream_id?: string | number;
  name?: string;
  stream_icon?: string;
  category_id?: string | number;
  epg_channel_id?: string | null;
};

/**
 * Loads live channels through the Xtream JSON API (`player_api.php`).
 * Preferred over `get.php` M3U export, which many panels block (HTTP 884)
 * or gate behind connection limits. Builds `.m3u8` (HLS) stream URLs so the
 * browser player / proxy can consume them directly.
 */
async function loadXtreamViaApi(entry: IptvPlaylistEntry): Promise<CacheEntry> {
  const creds = parseXtreamCreds(entry.m3uUrl);
  if (!creds) throw new Error("Identifiants Xtream introuvables dans l'URL.");
  const { base, username, password } = creds;
  const api = (action: string) =>
    `${base}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;

  const [categories, streams] = await Promise.all([
    fetchJson<XtreamCategory[]>(api("get_live_categories")),
    fetchJson<XtreamLiveStream[]>(api("get_live_streams"))
  ]);

  const catName = new Map<string, string>();
  for (const c of Array.isArray(categories) ? categories : []) {
    if (c.category_id != null) catName.set(String(c.category_id), c.category_name || "Autres");
  }

  const channels: IptvChannel[] = [];
  const seen = new Set<string>();
  let capped = false;
  for (const s of Array.isArray(streams) ? streams : []) {
    if (s.stream_id == null) continue;
    const streamId = String(s.stream_id);
    // Playback URL for the browser (HLS).
    const url = `${base}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.m3u8`;
    // Android parses get.php M3U with output=ts — IDs must use that stream URL shape.
    const androidStreamUrl = `${base}/live/${username}/${password}/${streamId}.ts`;
    const tvgId = s.epg_channel_id ? String(s.epg_channel_id) : null;
    const name = (s.name || "").trim() || "Sans nom";

    let legacyId = buildLegacyChannelId(tvgId, name, streamId);
    while (seen.has(`legacy:${legacyId}`)) {
      legacyId = hashString(`${legacyId}|${channels.length}`);
    }
    seen.add(`legacy:${legacyId}`);

    let id = buildAndroidChannelId(entry.id, androidStreamUrl, tvgId);
    while (seen.has(id)) id = `${id}~${channels.length}`;
    seen.add(id);

    channels.push({
      id,
      legacyId,
      name,
      logo: normalizeIptvLogoUrl(s.stream_icon, base),
      group: defaultGroupLabel(
        s.category_id != null ? catName.get(String(s.category_id)) : null
      ),
      url,
      tvgId,
      listId: entry.id
    });
    if (channels.length >= PARSE_CAP) {
      capped = true;
      break;
    }
  }

  if (channels.length === 0) throw new Error("Aucune chaîne renvoyée par l'API Xtream.");
  const epgUrl =
    entry.epgUrl?.trim() ||
    `${base}/xmltv.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  return { at: Date.now(), channels, epgUrl, capped };
}

async function loadPlaylist(entry: IptvPlaylistEntry): Promise<CacheEntry> {
  const type = detectPlaylistType(entry.m3uUrl);
  if (type === "Stalker") {
    throw new Error("Portails Stalker non supportés dans le viewer web (P3).");
  }

  // Prefer the same get.php M3U Android uses so favorite channel ids match.
  // Fall back to player_api JSON when the M3U export is blocked/gated.
  if (type === "Xtream") {
    const m3uUrl = normalizeToM3uUrl(entry.m3uUrl);
    const m3uKey = `m3u:${m3uUrl}`;
    const cachedM3u = cache.get(m3uKey);
    if (cachedM3u && Date.now() - cachedM3u.at < CACHE_TTL_MS) return cachedM3u;

    try {
      const text = await fetchText(m3uUrl);
      if (/#EXTINF/i.test(text)) {
        const parsed = parseM3u(text, entry.id, m3uUrl);
        const result: CacheEntry = {
          at: Date.now(),
          channels: parsed.channels,
          epgUrl: entry.epgUrl?.trim() || parsed.epgUrl || null,
          capped: parsed.capped
        };
        cache.set(m3uKey, result);
        return result;
      }
    } catch {
      /* fall through to player_api */
    }

    const apiKey = `xtream:${entry.m3uUrl.trim()}`;
    const cachedApi = cache.get(apiKey);
    if (cachedApi && Date.now() - cachedApi.at < CACHE_TTL_MS) return cachedApi;
    const result = await loadXtreamViaApi(entry);
    cache.set(apiKey, result);
    return result;
  }

  const url = normalizeToM3uUrl(entry.m3uUrl);
  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached;

  const text = await fetchText(url);
  if (!/#EXTINF/i.test(text)) throw new Error("Format M3U non reconnu.");
  const parsed = parseM3u(text, entry.id, url);
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
