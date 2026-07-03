import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { saveConnectionTrack } from "@/lib/web/continue-watching";

export const dynamic = "force-dynamic";

/**
 * Batched Continue Watching progress write. Called by the player on a debounce
 * (~every 20s), on pause, and once on exit (keepalive/sendBeacon) — never per
 * timeupdate tick. Non-fatal on failure (local resume remains authoritative).
 */
export async function POST(request: Request) {
  await requireUser("/web");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "corps JSON invalide" }, { status: 400 });
  }

  const profileId = typeof body.profile === "string" ? body.profile.trim() : "";
  const tmdbId = Number(body.tmdbId);
  const mediaType = body.mediaType === "tv" ? "tv" : "movie";
  if (!profileId || !Number.isFinite(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ ok: false, error: "profil / tmdbId requis" }, { status: 400 });
  }

  const result = await saveConnectionTrack({
    profileId,
    mediaType,
    tmdbId,
    season: body.season == null ? null : Number(body.season),
    episode: body.episode == null ? null : Number(body.episode),
    progress: Number(body.progress) || 0,
    progressSeconds: Number(body.progressSeconds) || 0,
    totalDurationSeconds: Number(body.totalDurationSeconds) || 0,
    title: typeof body.title === "string" ? body.title : null,
    episodeTitle: typeof body.episodeTitle === "string" ? body.episodeTitle : null,
    posterPath: typeof body.posterPath === "string" ? body.posterPath : null,
    backdropPath: typeof body.backdropPath === "string" ? body.backdropPath : null
  });

  // Missing migration / RLS → non-fatal for the viewer.
  return NextResponse.json(result, { status: 200 });
}
