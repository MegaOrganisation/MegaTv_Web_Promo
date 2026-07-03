import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { markWatched, scrobble, type ScrobbleAction } from "@/lib/web/trakt";

export const dynamic = "force-dynamic";

const ACTIONS: ScrobbleAction[] = ["start", "pause", "stop"];

/**
 * Trakt scrobble endpoint. Actions: start / pause / stop / watched. Degrades
 * gracefully — returns `{ linked: false }` when the profile has no Trakt token.
 * Called by the player at state changes (coalesced), not per tick.
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
  const action = String(body.action || "");
  const tmdbId = Number(body.tmdbId);
  const mediaType = body.mediaType === "tv" ? "tv" : "movie";
  if (!profileId || !Number.isFinite(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ ok: false, error: "profil / tmdbId requis" }, { status: 400 });
  }

  const target = {
    mediaType,
    tmdbId,
    imdbId: typeof body.imdbId === "string" ? body.imdbId : null,
    season: body.season == null ? null : Number(body.season),
    episode: body.episode == null ? null : Number(body.episode),
    progress: Number(body.progress) || 0
  } as const;

  if (action === "watched") {
    const result = await markWatched(profileId, target);
    return NextResponse.json(result, { status: 200 });
  }

  if (!ACTIONS.includes(action as ScrobbleAction)) {
    return NextResponse.json({ ok: false, error: "action inconnue" }, { status: 400 });
  }

  const result = await scrobble(profileId, action as ScrobbleAction, target);
  return NextResponse.json(result, { status: 200 });
}
