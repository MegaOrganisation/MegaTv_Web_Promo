import { NextResponse } from "next/server";

import { fetchTmdbMediaFull, pickTrailerKey } from "@/lib/tmdb";

/**
 * Lazy trailer-key endpoint for poster hover playback + the hero trending loop
 * (P2 visual parity).
 *
 * Free Tier rule: we do NOT pre-fetch trailers for every rail item / every hero
 * slide on the server. The client requests the key only for the item that is
 * actually being hovered/displayed, and caches it (module Map + localStorage).
 * The TMDB read itself is proxy-cached 12h, and this response is CDN-cacheable.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const type = params.get("type") === "tv" ? "tv" : "movie";
  const id = Number(params.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ key: null });
  }

  const full = await fetchTmdbMediaFull(type, id);
  const key = pickTrailerKey(full);

  return NextResponse.json(
    { key },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=43200, stale-while-revalidate=604800"
      }
    }
  );
}
