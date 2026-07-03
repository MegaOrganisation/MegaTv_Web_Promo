import { NextResponse } from "next/server";

import { fetchTmdbImages, pickTitleLogo, tmdbImageUrl } from "@/lib/tmdb";

/**
 * Lazy title-logo endpoint for landscape poster cards / hero (P2 visual parity).
 *
 * Free Tier rule: NEVER fetch a logo per item on server render (no fan-out).
 * The client calls this route once, on first hover/focus of a landscape card,
 * and caches the result (module Map + localStorage) so it is asked at most once
 * per title. The underlying TMDB `/images` read is proxy-cached 24h, and this
 * response is CDN-cacheable (public s-maxage) so repeat callers hit the edge.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const type = params.get("type") === "tv" ? "tv" : "movie";
  const id = Number(params.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ logo: null });
  }

  const images = await fetchTmdbImages(type, id);
  const logo = tmdbImageUrl(pickTitleLogo(images), "w500");

  return NextResponse.json(
    { logo },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
      }
    }
  );
}
