import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { tmdbImageUrl } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

type RawEpisode = {
  id: number;
  name?: string;
  overview?: string;
  still_path?: string | null;
  runtime?: number | null;
  episode_number?: number;
  season_number?: number;
  air_date?: string | null;
  vote_average?: number;
};

export type WebEpisode = {
  id: number;
  episodeNumber: number;
  seasonNumber: number;
  name: string;
  overview: string;
  stillUrl: string | null;
  runtime: number | null;
  airDate: string | null;
  voteAverage: number;
};

/**
 * Lazy per-season episode list for `/web/details/[mediaId]` (TV). Only the
 * clicked season is fetched (cached client-side + 12h server cache) to respect
 * the Free-Tier — never a full show fan-out. Replicates the tmdb-proxy fetch
 * because tmdb.ts exposes single-episode helpers only, not a season list.
 */
export async function GET(request: Request) {
  await requireUser("/web");

  const params = new URL(request.url).searchParams;
  const showId = Number(params.get("showId"));
  const season = Number(params.get("season"));
  if (!Number.isFinite(showId) || showId <= 0 || !Number.isFinite(season) || season < 0) {
    return NextResponse.json({ error: "showId / season requis" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ episodes: [] as WebEpisode[] });
  }

  const url = new URL(`${supabaseUrl.replace(/\/$/, "")}/functions/v1/tmdb-proxy`);
  url.searchParams.set("path", `/tv/${showId}/season/${season}`);
  url.searchParams.set("language", "fr-FR");

  const response = await fetch(url.toString(), {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    next: { revalidate: 60 * 60 * 12 }
  });

  if (!response.ok) {
    return NextResponse.json({ episodes: [] as WebEpisode[] });
  }

  const data = (await response.json()) as { episodes?: RawEpisode[] };
  const episodes = (data.episodes || []).map<WebEpisode>((ep) => ({
    id: ep.id,
    episodeNumber: Number(ep.episode_number) || 0,
    seasonNumber: Number(ep.season_number ?? season) || season,
    name: ep.name || `Épisode ${ep.episode_number ?? ""}`.trim(),
    overview: ep.overview || "",
    stillUrl: tmdbImageUrl(ep.still_path, "w342"),
    runtime: ep.runtime ?? null,
    airDate: ep.air_date ?? null,
    voteAverage: Number(ep.vote_average) || 0
  }));

  return NextResponse.json({ episodes });
}
