import { createClient } from "@/lib/supabase/server";
import type { WebMediaType } from "@/lib/web/media";

export type ConnectionTrackWrite = {
  profileId: string;
  mediaType: WebMediaType;
  tmdbId: number;
  season?: number | null;
  episode?: number | null;
  progress: number;
  progressSeconds: number;
  totalDurationSeconds?: number;
  title?: string | null;
  episodeTitle?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
};

/**
 * Batched Continue Watching cloud write into `profile_connection_tracks` via the
 * anti-duplication RPC. Callers debounce/coalesce (never per-second). Failures
 * are non-fatal (local resume in localStorage stays authoritative).
 */
export async function saveConnectionTrack(track: ConnectionTrackWrite) {
  const profileId = track.profileId.trim();
  if (!profileId || !track.tmdbId) {
    return { ok: false as const, error: "invalid track" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("megacompanion_upsert_connection_track", {
    p_profile_id: profileId,
    p_media_type: track.mediaType,
    p_tmdb_id: track.tmdbId,
    p_season: track.season ?? null,
    p_episode: track.episode ?? null,
    p_progress: Math.max(0, Math.min(1, Number(track.progress) || 0)),
    p_progress_seconds: Math.max(0, Math.floor(Number(track.progressSeconds) || 0)),
    p_total_duration_seconds: Math.max(0, Math.floor(Number(track.totalDurationSeconds) || 0)),
    p_title: track.title ?? null,
    p_episode_title: track.episodeTitle ?? null,
    p_poster_path: track.posterPath ?? null,
    p_backdrop_path: track.backdropPath ?? null,
    p_source: "web"
  });

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, data };
}
