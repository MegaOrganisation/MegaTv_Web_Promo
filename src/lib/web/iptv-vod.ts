import type { IptvPlaylistEntry } from "@/lib/iptv/types";
import { detectPlaylistType } from "@/lib/iptv/types";
import type { AddonStreamSource } from "@/lib/web/addon-streams";
import type { WebMediaType } from "@/lib/web/media";

const IPTV_UA = "VLC/3.0.20 LibVLC/3.0.20";
const FETCH_TIMEOUT_MS = 15000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const IPTV_VOD_PREFIX = "iptv_vod:";

type XtreamCreds = { base: string; username: string; password: string };

type XtreamVodStream = {
  stream_id?: string | number;
  name?: string;
  title?: string;
  year?: string;
  tmdb?: string | number;
  imdb?: string;
  container_extension?: string;
};

type XtreamSeriesEpisode = {
  id?: string | number;
  title?: string;
  container_extension?: string;
  info?: { movie_image?: string };
};

const vodCache = new Map<string, { at: number; streams: XtreamVodStream[] }>();

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

function credsFromPlaylist(playlist: IptvPlaylistEntry): XtreamCreds | null {
  return (
    parseXtreamCreds(playlist.m3uUrl) ||
    (playlist.epgUrl ? parseXtreamCreds(playlist.epgUrl) : null)
  );
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": IPTV_UA, accept: "application/json,*/*" },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseYear(text: string | undefined | null): number | null {
  if (!text) return null;
  const m = /(19|20)\d{2}/.exec(text);
  return m ? Number(m[0]) : null;
}

function scoreTitleMatch(candidate: string, target: string): number {
  const a = normalizeText(candidate);
  const b = normalizeText(target);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 85;
  const aWords = new Set(a.split(" ").filter(Boolean));
  const bWords = b.split(" ").filter(Boolean);
  if (bWords.length === 0) return 0;
  const hits = bWords.filter((w) => aWords.has(w)).length;
  return Math.round((hits / bWords.length) * 75);
}

function qualityFromName(name: string): string {
  if (/2160p|\b4k\b|uhd/i.test(name)) return "4K";
  if (/1080p|fhd/i.test(name)) return "1080p";
  if (/720p|\bhd\b/i.test(name)) return "720p";
  if (/480p|\bsd\b/i.test(name)) return "480p";
  return "SD/?";
}

async function getVodStreams(creds: XtreamCreds): Promise<XtreamVodStream[]> {
  const key = `${creds.base}|${creds.username}`;
  const cached = vodCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.streams;

  const url = `${creds.base}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_vod_streams`;
  const rows = await fetchJson<XtreamVodStream[]>(url);
  const streams = Array.isArray(rows) ? rows : [];
  vodCache.set(key, { at: Date.now(), streams });
  return streams;
}

function toMovieSource(
  creds: XtreamCreds,
  playlist: IptvPlaylistEntry,
  stream: XtreamVodStream,
  fallbackTitle: string
): AddonStreamSource | null {
  const streamId = stream.stream_id;
  if (streamId == null) return null;
  const ext = (stream.container_extension || "mp4").replace(/^\./, "");
  const url = `${creds.base}/movie/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.${ext}`;
  const title = (stream.name || stream.title || "").trim() || fallbackTitle;
  const qualityLabel = qualityFromName(title);
  const groupLabel = `IPTV - ${playlist.name}`;
  return {
    url,
    kind: /\.m3u8(\?|$)/i.test(url) ? "hls" : "mp4",
    provider: groupLabel,
    resolution: qualityLabel === "4K" ? 2160 : qualityLabel === "1080p" ? 1080 : qualityLabel === "720p" ? 720 : null,
    qualityLabel,
    detail: stream.year ? String(stream.year) : null,
    label: title,
    addonId: `${IPTV_VOD_PREFIX}${playlist.id}`
  };
}

function matchMovieStreams(
  vod: XtreamVodStream[],
  title: string,
  year: number | null,
  imdbId: string | null,
  tmdbId: number | null
): XtreamVodStream[] {
  if (tmdbId) {
    const tmdbStr = String(tmdbId);
    const byTmdb = vod.filter((s) => String(s.tmdb || "").replace(/\D/g, "") === tmdbStr);
    if (byTmdb.length) return byTmdb;
  }
  if (imdbId) {
    const norm = imdbId.replace(/^tt/i, "tt");
    const byImdb = vod.filter((s) => (s.imdb || "").toLowerCase().includes(norm.replace(/^tt/, "")));
    if (byImdb.length) return byImdb;
  }
  const normalizedTitle = normalizeText(title);
  if (!normalizedTitle) return [];
  const scored = vod
    .map((item) => {
      const name = (item.name || item.title || "").trim();
      if (!name) return null;
      let score = scoreTitleMatch(name, title);
      const itemYear = parseYear(item.year || name);
      if (year && itemYear) {
        const delta = Math.abs(itemYear - year);
        if (delta === 0) score += 20;
        else if (delta === 1) score += 8;
        else score -= 25;
      }
      return score > 0 ? { item, score } : null;
    })
    .filter((row): row is { item: XtreamVodStream; score: number } => row != null)
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.score ?? 0;
  const min = Math.max(65, best - 8);
  return scored.filter((row) => row.score >= min).map((row) => row.item);
}

async function seriesEpisodes(
  creds: XtreamCreds,
  seriesId: string | number
): Promise<XtreamSeriesEpisode[]> {
  const url = `${creds.base}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series_info&series_id=${encodeURIComponent(String(seriesId))}`;
  const data = await fetchJson<{ episodes?: Record<string, XtreamSeriesEpisode[]> }>(url);
  const episodes = data?.episodes;
  if (!episodes) return [];
  return Object.values(episodes).flat();
}

function toEpisodeSource(
  creds: XtreamCreds,
  playlist: IptvPlaylistEntry,
  episode: XtreamSeriesEpisode,
  label: string
): AddonStreamSource | null {
  const streamId = episode.id;
  if (streamId == null) return null;
  const ext = (episode.container_extension || "mp4").replace(/^\./, "");
  const url = `${creds.base}/series/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.${ext}`;
  const title = (episode.title || "").trim() || label;
  const qualityLabel = qualityFromName(title);
  return {
    url,
    kind: /\.m3u8(\?|$)/i.test(url) ? "hls" : "mp4",
    provider: `IPTV - ${playlist.name}`,
    resolution: null,
    qualityLabel,
    detail: null,
    label: title,
    addonId: `${IPTV_VOD_PREFIX}${playlist.id}`
  };
}

/** Resolves IPTV VOD streams from enabled Xtream playlists (movie + series episode). */
export async function resolveIptvVodStreams(
  playlists: IptvPlaylistEntry[],
  req: {
    mediaType: WebMediaType;
    title: string;
    year?: number | null;
    imdbId?: string | null;
    tmdbId?: number | null;
    season?: number | null;
    episode?: number | null;
  }
): Promise<AddonStreamSource[]> {
  const enabled = playlists.filter((p) => p.enabled !== false && detectPlaylistType(p.m3uUrl) === "Xtream");
  const out: AddonStreamSource[] = [];

  await Promise.all(
    enabled.map(async (playlist) => {
      const creds = credsFromPlaylist(playlist);
      if (!creds) return;
      const vod = await getVodStreams(creds);
      if (req.mediaType === "movie") {
        const matches = matchMovieStreams(vod, req.title, req.year ?? null, req.imdbId ?? null, req.tmdbId ?? null);
        for (const match of matches) {
          const source = toMovieSource(creds, playlist, match, req.title);
          if (source) out.push(source);
        }
        return;
      }

      if (!req.season || !req.episode) return;
      const seriesMatches = matchMovieStreams(vod, req.title, req.year ?? null, req.imdbId ?? null, req.tmdbId ?? null);
      for (const series of seriesMatches.slice(0, 2)) {
        const episodes = await seriesEpisodes(creds, series.stream_id!);
        const ep = episodes.find((row) => {
          const m = /s(\d{1,2})e(\d{1,2})/i.exec(row.title || "");
          if (m) return Number(m[1]) === req.season && Number(m[2]) === req.episode;
          return false;
        });
        if (ep) {
          const source = toEpisodeSource(creds, playlist, ep, `${req.title} S${req.season}E${req.episode}`);
          if (source) out.push(source);
        }
      }
    })
  );

  return out;
}
