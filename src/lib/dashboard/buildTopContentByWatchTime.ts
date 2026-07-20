"use client";

/**
 * Agrège le temps de visionnage cumulé (historique) pour le Top contenus.
 * Priorité : somme watch_seconds par titre (film / série), pas par épisode seul.
 */
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";
import type { TopContentRow } from "@/lib/supabase/types";

function showKey(mediaType: "movie" | "tv", tmdbId: number) {
  return `${mediaType}:${tmdbId}`;
}

export function buildTopContentByWatchTime(
  history: WatchHistoryRow[],
  rpcFallback: TopContentRow[] = [],
  limit = 12
): TopContentRow[] {
  const map = new Map<
    string,
    {
      media_type: "movie" | "tv";
      tmdb_id: number;
      title: string | null;
      episode_title: string | null;
      poster_path: string | null;
      backdrop_path: string | null;
      watch_seconds: number;
      last_watched_at: string | null;
      season: number | null;
      episode: number | null;
      progress: number | null;
    }
  >();

  for (const row of history) {
    const key = showKey(row.media_type, row.tmdb_id);
    const prev = map.get(key);
    const add = Math.max(0, Number(row.watch_seconds) || 0);
    if (!prev) {
      map.set(key, {
        media_type: row.media_type,
        tmdb_id: row.tmdb_id,
        title: row.title,
        episode_title: row.episode_title,
        poster_path: row.poster_path,
        backdrop_path: null,
        watch_seconds: add,
        last_watched_at: row.created_at,
        season: row.media_type === "tv" ? row.season : null,
        episode: row.media_type === "tv" ? row.episode : null,
        progress: row.progress
      });
    } else {
      prev.watch_seconds += add;
      if (!prev.poster_path && row.poster_path) prev.poster_path = row.poster_path;
      if (!prev.title && row.title) prev.title = row.title;
      if (row.created_at && (!prev.last_watched_at || row.created_at > prev.last_watched_at)) {
        prev.last_watched_at = row.created_at;
      }
    }
  }

  // Enrichit avec meta RPC (backdrop, titres) si dispo
  for (const rpc of rpcFallback) {
    const key = showKey(rpc.media_type, rpc.tmdb_id);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        media_type: rpc.media_type,
        tmdb_id: rpc.tmdb_id,
        title: rpc.title,
        episode_title: rpc.episode_title,
        poster_path: rpc.poster_path,
        backdrop_path: rpc.backdrop_path,
        watch_seconds: Math.max(0, Number(rpc.watch_seconds) || 0),
        last_watched_at: rpc.last_watched_at,
        season: rpc.season,
        episode: rpc.episode,
        progress: rpc.progress
      });
    } else {
      if (!prev.backdrop_path && rpc.backdrop_path) prev.backdrop_path = rpc.backdrop_path;
      if (!prev.poster_path && rpc.poster_path) prev.poster_path = rpc.poster_path;
      if (!prev.title && rpc.title) prev.title = rpc.title;
      // Si l’historique n’a pas de secondes mais le RPC oui
      if (prev.watch_seconds <= 0 && rpc.watch_seconds > 0) {
        prev.watch_seconds = Number(rpc.watch_seconds) || 0;
      }
    }
  }

  return Array.from(map.values())
    .filter((row) => row.watch_seconds > 0 || row.poster_path)
    .sort((a, b) => b.watch_seconds - a.watch_seconds)
    .slice(0, limit)
    .map((row) => ({
      media_type: row.media_type,
      tmdb_id: row.tmdb_id,
      season: row.season,
      episode: row.episode,
      title: row.title,
      episode_title: row.episode_title,
      poster_path: row.poster_path,
      backdrop_path: row.backdrop_path,
      watch_seconds: row.watch_seconds,
      progress: row.progress,
      last_watched_at: row.last_watched_at
    }));
}
