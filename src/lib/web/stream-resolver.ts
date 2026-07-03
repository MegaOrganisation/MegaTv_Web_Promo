import type { CompanionAddon } from "@/lib/companion/sync-types";
import { fetchImdbId } from "@/lib/tmdb";
import { resolveAddonStreams, type AddonStreamSource } from "@/lib/web/addon-streams";
import { resolveIptvVodStreams } from "@/lib/web/iptv-vod";
import type { WebMediaType } from "@/lib/web/media";
import { proxyUrl } from "@/lib/web/stream-proxy";

export type ResolvedStream = {
  url: string;
  /** MIME hint; `hls` routes through hls.js / native HLS. */
  type: "hls" | "mp4";
  /** Primary display title (torrent name / IPTV VOD title). */
  title: string;
  label: string;
  provider?: string;
  groupId?: string;
  groupLabel?: string;
  quality?: string;
  detail?: string | null;
  resolution?: number | null;
  /** Same source routed through the signed Edge proxy (CORS fallback). */
  proxiedUrl?: string | null;
  addonId?: string;
};

export type StreamRequest = {
  mediaType: WebMediaType;
  tmdbId: number;
  season?: number | null;
  episode?: number | null;
  /** Explicit override passed via `?src=` — highest priority. */
  overrideUrl?: string | null;
};

export type StreamResolution = {
  sources: ResolvedStream[];
  /** Why the list is empty (for a helpful UI message). */
  reason: "ok" | "no-addons" | "no-imdb" | "no-streams" | "override";
  imdbId: string | null;
};

function directOverride(url: string): ResolvedStream {
  const clean = url.trim();
  const type: ResolvedStream["type"] = /\.m3u8(\?|$)/i.test(clean) ? "hls" : "mp4";
  return {
    url: clean,
    type,
    title: "Source directe",
    label: "Source directe",
    provider: "Direct",
    groupLabel: "Direct",
    proxiedUrl: proxyUrl(clean, type === "hls" ? "m3u8" : "seg")
  };
}

function mapAddonSource(source: AddonStreamSource): ResolvedStream {
  const groupLabel = source.provider || "Addon";
  return {
    url: source.url,
    type: source.kind,
    title: source.label,
    label: source.label,
    provider: groupLabel,
    groupId: source.addonId,
    groupLabel,
    quality: source.qualityLabel,
    detail: source.detail,
    resolution: source.resolution,
    addonId: source.addonId,
    proxiedUrl: proxyUrl(source.url, source.kind === "hls" ? "m3u8" : "seg")
  };
}

/**
 * Real P3 source resolution: IPTV VOD playlists + Stremio addons. An explicit
 * `?src=` override always wins.
 */
export async function resolveStreamSources(
  req: StreamRequest,
  addons: CompanionAddon[],
  options?: { iptvPlaylists?: Parameters<typeof resolveIptvVodStreams>[0]; title?: string; year?: number | null }
): Promise<StreamResolution> {
  const override = req.overrideUrl?.trim();
  if (override) {
    return { sources: [directOverride(override)], reason: "override", imdbId: null };
  }

  const enabled = addons.filter((addon) => addon.isEnabled !== false);
  const imdbId = await fetchImdbId(req.mediaType, req.tmdbId);

  const iptvSources =
    options?.iptvPlaylists && options.iptvPlaylists.length
      ? await resolveIptvVodStreams(options.iptvPlaylists, {
          mediaType: req.mediaType,
          title: options.title || "",
          year: options.year ?? null,
          imdbId,
          tmdbId: req.tmdbId,
          season: req.season,
          episode: req.episode
        })
      : [];

  const addonSources =
    enabled.length && imdbId
      ? await resolveAddonStreams(enabled, {
          mediaType: req.mediaType,
          imdbId,
          season: req.season,
          episode: req.episode
        })
      : [];

  const sources: ResolvedStream[] = [...iptvSources, ...addonSources].map(mapAddonSource);

  if (enabled.length === 0 && iptvSources.length === 0) {
    return { sources: [], reason: "no-addons", imdbId };
  }
  if (!imdbId && iptvSources.length === 0) {
    return { sources: [], reason: "no-imdb", imdbId: null };
  }

  return {
    sources,
    reason: sources.length ? "ok" : "no-streams",
    imdbId
  };
}
