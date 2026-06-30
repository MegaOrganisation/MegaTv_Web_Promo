import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { fetchTmdbDetails, tmdbImageUrl } from "@/lib/tmdb";

export async function GET(request: Request) {
  await requireUser("/companion");

  const { searchParams } = new URL(request.url);
  const mediaType = searchParams.get("media_type") === "tv" ? "tv" : "movie";
  const tmdbId = Number(searchParams.get("tmdb_id"));

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "Invalid tmdb_id" }, { status: 400 });
  }

  const details = await fetchTmdbDetails(mediaType, tmdbId);
  if (!details) return NextResponse.json({ error: "TMDB unavailable" }, { status: 502 });

  return NextResponse.json({
    id: details.id,
    title: details.title || details.name || "Contenu MegaTv",
    overview: details.overview || null,
    posterUrl: tmdbImageUrl(details.poster_path, "w342"),
    backdropUrl: tmdbImageUrl(details.backdrop_path, "w780")
  });
}
