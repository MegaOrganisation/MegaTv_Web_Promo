import { tmdbImageUrl } from "@/lib/tmdb";
import type { ContinueWatchingRow, TopContentRow } from "@/lib/supabase/types";

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
  overview?: string | null;
  progress?: number | null;
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

export function continueWatchingToItem(row: ContinueWatchingRow): WebMediaItem | null {
  if (!row.tmdb_id) return null;
  return {
    mediaId: encodeMediaId(row.media_type, row.tmdb_id, row.season, row.episode),
    mediaType: row.media_type,
    tmdbId: row.tmdb_id,
    title: row.title || row.episode_title || "Contenu MegaTv",
    subtitle: row.media_type === "tv" && row.season ? `S${row.season}·E${row.episode ?? 1}` : null,
    posterUrl: tmdbImageUrl(row.poster_path, "w342"),
    backdropUrl: tmdbImageUrl(row.backdrop_path, "w780"),
    progress: typeof row.progress === "number" ? row.progress : null,
    season: row.season,
    episode: row.episode
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
    backdropUrl: tmdbImageUrl(row.backdrop_path, "w780"),
    progress: typeof row.progress === "number" ? row.progress : null,
    season: row.season,
    episode: row.episode
  };
}
