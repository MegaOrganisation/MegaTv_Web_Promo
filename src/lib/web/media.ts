import { tmdbBackdropUrl, tmdbImageUrl } from "@/lib/tmdb";
import type { ContinueWatchingRow, TopContentRow } from "@/lib/supabase/types";
import { formatResumeClock } from "@/lib/web/playbackTime";

export type WebMediaType = "movie" | "tv";

/** Normalized card used across web rails, hero, details. */
export type WebMediaItem = {
  /** Stable web route id, e.g. `movie-603`. */
  mediaId: string;
  mediaType: WebMediaType;
  tmdbId: number | null;
  title: string;
  subtitle?: string | null;
  posterUrl: string | null;
  backdropUrl?: string | null;
  /** TMDB title logo path/URL, overlaid on landscape cards / hero (see fetchTmdbImages). */
  logoUrl?: string | null;
  overview?: string | null;
  progress?: number | null;
  /** Seconds watched — used for CW progress bar labels. */
  progressSeconds?: number | null;
  totalDurationSeconds?: number | null;
  episodeTitle?: string | null;
  season?: number | null;
  episode?: number | null;
};

/** Encodes a media reference into the `/web/details/[mediaId]` param. */
export function encodeMediaId(mediaType: WebMediaType, tmdbId: number, season?: number | null, episode?: number | null) {
  const base = `${mediaType}-${tmdbId}`;
  if (mediaType === "tv" && season && episode) return `${base}-s${season}e${episode}`;
  return base;
}

/** Parses a `/web/details/[mediaId]` param back into a reference. */
export function decodeMediaId(mediaId: string): {
  mediaType: WebMediaType;
  tmdbId: number;
  season: number | null;
  episode: number | null;
} | null {
  const match = /^(movie|tv)-(\d+)(?:-s(\d+)e(\d+))?$/i.exec(mediaId.trim());
  if (!match) return null;
  const tmdbId = Number(match[2]);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) return null;
  return {
    mediaType: match[1].toLowerCase() === "tv" ? "tv" : "movie",
    tmdbId,
    season: match[3] ? Number(match[3]) : null,
    episode: match[4] ? Number(match[4]) : null
  };
}

function continueWatchingSubtitle(row: ContinueWatchingRow): string | null {
  if (row.media_type === "tv" && row.season) {
    const ep = row.episode ?? 1;
    if (row.episode_title) return `S${row.season} • E${ep} - ${row.episode_title}`;
    return `S${row.season}·E${ep}`;
  }
  if (row.progress_seconds && row.progress_seconds > 0) {
    return `Continue from ${formatResumeClock(row.progress_seconds)}`;
  }
  return null;
}

export function continueWatchingToItem(row: ContinueWatchingRow): WebMediaItem | null {
  if (!row.tmdb_id) return null;
  return {
    mediaId: encodeMediaId(row.media_type, row.tmdb_id, row.season, row.episode),
    mediaType: row.media_type,
    tmdbId: row.tmdb_id,
    title: row.title || row.episode_title || "Contenu MegaTv",
    subtitle: continueWatchingSubtitle(row),
    posterUrl: tmdbImageUrl(row.poster_path, "w342"),
    backdropUrl: tmdbBackdropUrl(row.backdrop_path),
    progress: typeof row.progress === "number" ? row.progress : null,
    progressSeconds: row.progress_seconds,
    totalDurationSeconds: row.total_duration_seconds,
    episodeTitle: row.episode_title,
    season: row.season,
    episode: row.episode
  };
}

/** Builds a minimal WebMediaItem from a catalog preview tile (Trakt / direct TMDB ref). */
export function previewToMediaItem(
  posterUrl: string,
  mediaId: string,
  _fallbackTitle: string,
  itemTitle?: string | null
): WebMediaItem | null {
  const ref = decodeMediaId(mediaId);
  if (!ref) return null;
  return {
    mediaId,
    mediaType: ref.mediaType,
    tmdbId: ref.tmdbId,
    title: itemTitle?.trim() && !/^(poster|backdrop)$/i.test(itemTitle.trim()) ? itemTitle.trim() : "",
    posterUrl
  };
}

export function topContentToItem(row: TopContentRow): WebMediaItem | null {
  if (!row.tmdb_id) return null;
  return {
    mediaId: encodeMediaId(row.media_type, row.tmdb_id, row.season, row.episode),
    mediaType: row.media_type,
    tmdbId: row.tmdb_id,
    title: row.title || row.episode_title || "Contenu MegaTv",
    posterUrl: tmdbImageUrl(row.poster_path, "w342"),
    backdropUrl: tmdbBackdropUrl(row.backdrop_path),
    progress: typeof row.progress === "number" ? row.progress : null,
    season: row.season,
    episode: row.episode
  };
}
