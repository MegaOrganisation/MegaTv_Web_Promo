import { NextResponse } from "next/server";

import { fetchTmdbDetails, tmdbImageUrl } from "@/lib/tmdb";

/**
 * Lightweight TMDB card enrich for landscape `PosterCard` (backdrop + title).
 * Public + CDN-cached like `/api/web/title-logo` — no per-item server fan-out on SSR.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const type = params.get("type") === "tv" ? "tv" : "movie";
  const id = Number(params.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ title: null, backdropUrl: null });
  }

  const details = await fetchTmdbDetails(type, id);
  if (!details) {
    return NextResponse.json({ title: null, backdropUrl: null });
  }

  return NextResponse.json(
    {
      title: details.title || details.name || null,
      backdropUrl: tmdbImageUrl(details.backdrop_path, "w780")
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
      }
    }
  );
}
