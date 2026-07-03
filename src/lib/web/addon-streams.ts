import type { CompanionAddon } from "@/lib/companion/sync-types";
import type { WebMediaType } from "@/lib/web/media";

/**
 * Stremio addon stream/subtitle resolution for the web player.
 *
 * Mirrors the Android `AddonRuntimeAggregator` + `SourceFilterEngine`:
 * - queries each enabled Stremio addon's `/stream/{type}/{id}.json` endpoint
 *   server-side (no browser CORS, addon transport URL never exposed);
 * - keeps only browser-playable HTTP(S) sources — torrents (`infoHash` /
 *   `magnet:`) are dropped (not natively playable in a browser);
 * - parses quality/provider from the stream name/title and applies a priority
 *   ordering analogous to `SourcePriorityEntry` (4K deprioritised vs 1080p for
 *   smooth in-browser playback / bandwidth).
 */
export type AddonStreamSource = {
  url: string;
  /** Container hint used by the player. */
  kind: "hls" | "mp4";
  /** Provider / addon name for the source picker. */
  provider: string;
  /** Human readable label (provider · quality). */
  label: string;
  /** Detected vertical resolution (2160/1080/720/…) or null. */
  resolution: number | null;
  qualityLabel: string;
  /** Extra hints extracted from the title (HDR, cache status, size). */
  detail: string | null;
  addonId: string;
};

export type AddonSubtitleTrack = {
  id: string;
  lang: string;
  label: string;
  url: string;
};

type StremioStream = {
  name?: string;
  title?: string;
  description?: string;
  url?: string;
  infoHash?: string;
  behaviorHints?: { notWebReady?: boolean; filename?: string; videoSize?: number };
  subtitles?: Array<{ id?: string; url?: string; lang?: string }>;
};

type StremioSubtitle = { id?: string; url?: string; lang?: string };

const FETCH_TIMEOUT_MS = 12000;
const MAX_STREAMS_PER_ADDON = 40;

/** Strips `/manifest.json` (and trailing slash) to get the addon transport base. */
function addonBase(addon: CompanionAddon): string | null {
  const raw = (addon.transportUrl || addon.url || "").trim();
  if (!raw) return null;
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProto.replace(/\/manifest\.json.*$/i, "").replace(/\/$/, "");
}

function isStremioAddon(addon: CompanionAddon): boolean {
  if (addon.isEnabled === false) return false;
  if (addon.runtimeKind && addon.runtimeKind !== "STREMIO") return false;
  const base = addonBase(addon);
  return Boolean(base);
}

/** Stremio content id: `tt123` (movie) or `tt123:2:5` (series episode). */
function buildStremioId(imdbId: string, season?: number | null, episode?: number | null): string {
  if (season && episode) return `${imdbId}:${season}:${episode}`;
  return imdbId;
}

function stremioType(mediaType: WebMediaType): "movie" | "series" {
  return mediaType === "tv" ? "series" : "movie";
}

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "MegaTvWeb/1.0", accept: "application/json" },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const RES_PATTERNS: Array<{ re: RegExp; res: number; label: string }> = [
  { re: /(2160p|\b4k\b|uhd)/i, res: 2160, label: "4K" },
  { re: /1440p/i, res: 1440, label: "1440p" },
  { re: /1080p|\bfhd\b/i, res: 1080, label: "1080p" },
  { re: /720p|\bhd\b/i, res: 720, label: "720p" },
  { re: /480p|\bsd\b/i, res: 480, label: "480p" },
  { re: /360p/i, res: 360, label: "360p" }
];

function detectQuality(text: string): { resolution: number | null; label: string } {
  for (const entry of RES_PATTERNS) {
    if (entry.re.test(text)) return { resolution: entry.res, label: entry.label };
  }
  return { resolution: null, label: "SD/?" };
}

function detectDetail(text: string): string | null {
  const bits: string[] = [];
  if (/dolby\s?vision|\bdv\b/i.test(text)) bits.push("DV");
  else if (/hdr10\+?|hdr/i.test(text)) bits.push("HDR");
  const size = /([\d.]+\s?(gb|mb))/i.exec(text);
  if (size) bits.push(size[1].toUpperCase().replace(/\s+/g, ""));
  const seeders = /👤\s?(\d+)/.exec(text);
  if (seeders) bits.push(`${seeders[1]}👤`);
  return bits.length ? bits.join(" · ") : null;
}

function looksLikeTorrent(stream: StremioStream): boolean {
  if (stream.infoHash) return true;
  if (!stream.url) return true;
  return /^magnet:/i.test(stream.url);
}

/**
 * Priority score (higher = shown first). Mirrors `SourceFilterEngine`: 1080p is
 * the sweet spot for browser playback, 4K is deprioritised (bandwidth / decode),
 * unknown quality sinks to the bottom.
 */
function priorityScore(resolution: number | null): number {
  switch (resolution) {
    case 1080:
      return 100;
    case 720:
      return 90;
    case 1440:
      return 80;
    case 2160:
      return 70;
    case 480:
      return 40;
    case 360:
      return 30;
    default:
      return 10;
  }
}

function parseStreams(raw: unknown, addon: CompanionAddon): AddonStreamSource[] {
  const streams = (raw as { streams?: StremioStream[] } | null)?.streams;
  if (!Array.isArray(streams)) return [];
  const provider = addon.name?.trim() || "Addon";
  const out: AddonStreamSource[] = [];

  for (const stream of streams.slice(0, MAX_STREAMS_PER_ADDON)) {
    if (looksLikeTorrent(stream)) continue;
    const url = stream.url?.trim();
    if (!url || !/^https?:\/\//i.test(url)) continue;

    const text = `${stream.name || ""} ${stream.title || ""} ${stream.description || ""} ${
      stream.behaviorHints?.filename || ""
    }`;
    const { resolution, label } = detectQuality(text);
    const kind: AddonStreamSource["kind"] = /\.m3u8(\?|$)/i.test(url) ? "hls" : "mp4";
    const detail = detectDetail(text);
    out.push({
      url,
      kind,
      provider,
      resolution,
      qualityLabel: label,
      detail,
      label: `${provider} · ${label}${detail ? ` · ${detail}` : ""}`,
      addonId: addon.id
    });
  }
  return out;
}

function dedupeAndSort(sources: AddonStreamSource[]): AddonStreamSource[] {
  const seen = new Set<string>();
  const unique = sources.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
  return unique.sort((a, b) => {
    const diff = priorityScore(b.resolution) - priorityScore(a.resolution);
    if (diff !== 0) return diff;
    return (b.resolution || 0) - (a.resolution || 0);
  });
}

export type AddonStreamRequest = {
  mediaType: WebMediaType;
  imdbId: string;
  season?: number | null;
  episode?: number | null;
};

/** Queries all enabled Stremio addons in parallel and returns ranked HTTP sources. */
export async function resolveAddonStreams(
  addons: CompanionAddon[],
  req: AddonStreamRequest
): Promise<AddonStreamSource[]> {
  const usable = addons.filter(isStremioAddon);
  if (usable.length === 0) return [];

  const type = stremioType(req.mediaType);
  const id = buildStremioId(req.imdbId, req.season, req.episode);

  const results = await Promise.all(
    usable.map(async (addon) => {
      const base = addonBase(addon);
      if (!base) return [];
      const raw = await fetchJson(`${base}/stream/${type}/${encodeURIComponent(id)}.json`);
      return parseStreams(raw, addon);
    })
  );

  return dedupeAndSort(results.flat());
}

const SUB_LANG_LABELS: Record<string, string> = {
  fr: "Français",
  fre: "Français",
  fra: "Français",
  en: "English",
  eng: "English",
  es: "Español",
  spa: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  ar: "العربية"
};

function subtitleLabel(lang: string): string {
  const key = lang.toLowerCase().slice(0, 3);
  return SUB_LANG_LABELS[key] || SUB_LANG_LABELS[key.slice(0, 2)] || lang.toUpperCase();
}

function parseSubtitles(raw: unknown): AddonSubtitleTrack[] {
  const subs = (raw as { subtitles?: StremioSubtitle[] } | null)?.subtitles;
  if (!Array.isArray(subs)) return [];
  const seen = new Set<string>();
  const out: AddonSubtitleTrack[] = [];
  for (const sub of subs) {
    const url = sub.url?.trim();
    const lang = (sub.lang || sub.id || "").trim();
    if (!url || !/^https?:\/\//i.test(url) || !lang) continue;
    const key = `${lang}|${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: sub.id?.trim() || `${lang}-${out.length}`, lang, label: subtitleLabel(lang), url });
  }
  return out;
}

/** Queries subtitle-capable Stremio addons for external subtitle tracks. */
export async function resolveAddonSubtitles(
  addons: CompanionAddon[],
  req: AddonStreamRequest
): Promise<AddonSubtitleTrack[]> {
  const usable = addons.filter(isStremioAddon);
  if (usable.length === 0) return [];

  const type = stremioType(req.mediaType);
  const id = buildStremioId(req.imdbId, req.season, req.episode);

  const results = await Promise.all(
    usable.map(async (addon) => {
      const base = addonBase(addon);
      if (!base) return [];
      const raw = await fetchJson(`${base}/subtitles/${type}/${encodeURIComponent(id)}.json`);
      return parseSubtitles(raw);
    })
  );

  return results.flat();
}
