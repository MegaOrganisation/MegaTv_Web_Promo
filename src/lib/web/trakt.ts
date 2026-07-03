import { createClient } from "@/lib/supabase/server";
import type { WebMediaType } from "@/lib/web/media";

/**
 * Trakt scrobble bridge for the web player. Reuses the existing `trakt-proxy`
 * Edge function (path allowlist + rate limit). Degrades gracefully: when no
 * access token is linked for the profile every call is a silent no-op.
 *
 * Free Tier: token lookup is a single narrow read, no monolithic blob.
 */
export type ScrobbleAction = "start" | "pause" | "stop";

export type ScrobbleTarget = {
  mediaType: WebMediaType;
  tmdbId: number;
  imdbId?: string | null;
  season?: number | null;
  episode?: number | null;
  /** 0–100 playback percentage. */
  progress: number;
};

type TraktToken = { access_token?: string; accessToken?: string } | null;

/**
 * Best-effort Trakt access token for a profile. Tries the legacy per-profile
 * `profiles.trakt_token` column; any failure (RLS, missing table, empty token)
 * returns null so the caller degrades gracefully. NOTE: in the current data the
 * cloud Trakt tokens are typically empty (see synchronisation_trakt_et_cloud) —
 * scrobble is wired end-to-end but stays dormant until a token exists.
 */
export async function getTraktAccessToken(profileId: string): Promise<string | null> {
  const id = profileId.trim();
  if (!id) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").select("trakt_token").eq("id", id).maybeSingle();
    if (error || !data?.trakt_token) return null;
    const token = data.trakt_token as TraktToken;
    const access = token?.access_token || token?.accessToken;
    return typeof access === "string" && access.trim() ? access.trim() : null;
  } catch {
    return null;
  }
}

function scrobbleBody(target: ScrobbleTarget) {
  const clampProgress = Math.max(0, Math.min(100, Number(target.progress) || 0));
  if (target.mediaType === "tv" && target.season && target.episode) {
    return {
      show: { ids: buildIds(target) },
      episode: { season: target.season, number: target.episode },
      progress: clampProgress
    };
  }
  return { movie: { ids: buildIds(target) }, progress: clampProgress };
}

function buildIds(target: ScrobbleTarget) {
  const ids: Record<string, string | number> = {};
  if (target.imdbId && /^tt\d+$/i.test(target.imdbId)) ids.imdb = target.imdbId;
  if (target.tmdbId) ids.tmdb = target.tmdbId;
  return ids;
}

async function callTraktProxy(path: string, token: string, body: unknown): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return false;

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/trakt-proxy`;
  const url = new URL(endpoint);
  url.searchParams.set("path", path);
  url.searchParams.set("method", "POST");

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "x-user-token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      cache: "no-store"
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Scrobble start/pause/stop. Returns `{ linked }` so callers know if it ran. */
export async function scrobble(profileId: string, action: ScrobbleAction, target: ScrobbleTarget) {
  const token = await getTraktAccessToken(profileId);
  if (!token) return { ok: true as const, linked: false };
  const ok = await callTraktProxy(`/scrobble/${action}`, token, scrobbleBody(target));
  return { ok, linked: true };
}

/** Marks a movie/episode watched in the Trakt history (called on completion). */
export async function markWatched(profileId: string, target: ScrobbleTarget) {
  const token = await getTraktAccessToken(profileId);
  if (!token) return { ok: true as const, linked: false };

  const body =
    target.mediaType === "tv" && target.season && target.episode
      ? {
          shows: [
            {
              ids: buildIds(target),
              seasons: [{ number: target.season, episodes: [{ number: target.episode }] }]
            }
          ]
        }
      : { movies: [{ ids: buildIds(target) }] };

  const ok = await callTraktProxy("/sync/history", token, body);
  return { ok, linked: true };
}
