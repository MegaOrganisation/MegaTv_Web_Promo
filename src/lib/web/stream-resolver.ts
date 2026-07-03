import type { CompanionAddon } from "@/lib/companion/sync-types";
import { resolveAddonStreams } from "@/lib/web/addon-streams";
import type { WebMediaType } from "@/lib/web/media";
import { proxyUrl } from "@/lib/web/stream-proxy";
import { fetchImdbId } from "@/lib/tmdb";

export type ResolvedStream = {
  url: string;
  /** MIME hint; `hls` routes through hls.js / native HLS. */
  type: "hls" | "mp4";
  label: string;
  provider?: string;
  quality?: string;
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
    label: "Source directe",
    provider: "Direct",
    proxiedUrl: proxyUrl(clean, type === "hls" ? "m3u8" : "seg")
  };
}

/**
 * Real P3 source resolution: resolves the IMDb id for the title, queries the
 * profile's enabled Stremio addons for HTTP streams, and returns a ranked list
 * for the source picker. An explicit `?src=` override always wins.
 */
export async function resolveStreamSources(
  req: StreamRequest,
  addons: CompanionAddon[]
): Promise<StreamResolution> {
  const override = req.overrideUrl?.trim();
  if (override) {
    return { sources: [directOverride(override)], reason: "override", imdbId: null };
  }

  const enabled = addons.filter((addon) => addon.isEnabled !== false);
  if (enabled.length === 0) {
    return { sources: [], reason: "no-addons", imdbId: null };
  }

  const imdbId = await fetchImdbId(req.mediaType, req.tmdbId);
  if (!imdbId) {
    return { sources: [], reason: "no-imdb", imdbId: null };
  }

  const addonSources = await resolveAddonStreams(enabled, {
    mediaType: req.mediaType,
    imdbId,
    season: req.season,
    episode: req.episode
  });

  const sources: ResolvedStream[] = addonSources.map((source) => ({
    url: source.url,
    type: source.kind,
    label: source.label,
    provider: source.provider,
    quality: source.qualityLabel,
    resolution: source.resolution,
    addonId: source.addonId,
    proxiedUrl: proxyUrl(source.url, source.kind === "hls" ? "m3u8" : "seg")
  }));

  return {
    sources,
    reason: sources.length ? "ok" : "no-streams",
    imdbId
  };
}
