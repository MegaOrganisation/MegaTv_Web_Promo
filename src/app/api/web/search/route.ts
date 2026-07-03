import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { searchTmdbMulti, tmdbImageUrl } from "@/lib/tmdb";
import { encodeMediaId, type WebMediaItem } from "@/lib/web/media";

/**
 * Global search for `/web/search`. Proxies TMDB multi-search (server-cached 1h)
 * so we never expose keys and stay within Free Tier limits (min 2 chars,
 * debounced client-side, results reused via an in-memory client cache).
 */
export async function GET(request: Request) {
  await requireUser("/web");

  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (query.length < 2) {
    return NextResponse.json({ results: [] as WebMediaItem[] });
  }

  const raw = await searchTmdbMulti(query);
  const results = raw
    .filter((item) => item.poster_path || item.backdrop_path)
    .map<WebMediaItem>((item) => {
      const mediaType = item.media_type === "tv" ? "tv" : "movie";
      return {
        mediaId: encodeMediaId(mediaType, item.id),
        mediaType,
        tmdbId: item.id,
        title: item.title || item.name || "Contenu MegaTv",
        subtitle: (item.release_date || item.first_air_date || "").slice(0, 4) || null,
        posterUrl: tmdbImageUrl(item.poster_path, "w342"),
        backdropUrl: tmdbImageUrl(item.backdrop_path, "w780"),
        overview: item.overview || null
      };
    })
    .slice(0, 40);

  return NextResponse.json({ results });
}
