import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { fetchTmdbTrending, searchTmdbMulti, tmdbBackdropUrl, tmdbImageUrl } from "@/lib/tmdb";
import { encodeMediaId, type WebMediaItem } from "@/lib/web/media";

export type WebSearchItem = WebMediaItem & {
  isPerson?: boolean;
  voteAverage?: number | null;
  department?: string | null;
};

/**
 * Global search for `/web/search`. Proxies TMDB multi-search and trending (server-cached)
 * so we never expose keys and stay within Free Tier limits.
 */
export async function GET(request: Request) {
  await requireUser("/companion");

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  const isTrending = url.searchParams.get("trending") === "true" || url.searchParams.get("mode") === "trending";

  if (isTrending || (!query && !url.searchParams.has("q"))) {
    try {
      const rawTrending = await fetchTmdbTrending("day", 28);
      const trendingItems = (rawTrending || [])
        .filter((item) => item.poster_path || item.backdrop_path)
        .map<WebSearchItem>((item) => {
          const mediaType = item.media_type === "tv" ? "tv" : "movie";
          return {
            mediaId: encodeMediaId(mediaType, item.id),
            mediaType,
            isPerson: false,
            tmdbId: item.id,
            title: item.title || item.name || "Contenu MegaTv",
            subtitle: (item.release_date || item.first_air_date || "").slice(0, 4) || null,
            posterUrl: tmdbImageUrl(item.poster_path, "w342"),
            backdropUrl: tmdbBackdropUrl(item.backdrop_path),
            overview: item.overview || null,
            voteAverage: typeof item.vote_average === "number" && item.vote_average > 0 ? Math.round(item.vote_average * 10) / 10 : null
          };
        });

      // Curated trending queries for quick chips
      const popularQueries = [
        ...new Set(
          trendingItems
            .map((item) => item.title)
            .filter((title): title is string => Boolean(title && title.length < 35))
        )
      ].slice(0, 10);

      return NextResponse.json({
        trending: trendingItems,
        popularQueries:
          popularQueries.length > 0
            ? popularQueries
            : ["Dune", "Deadpool", "The Penguin", "Gladiator", "Arcane", "Stranger Things"]
      });
    } catch {
      return NextResponse.json({
        trending: [],
        popularQueries: ["Dune", "Deadpool", "The Penguin", "Gladiator", "Arcane", "Stranger Things"]
      });
    }
  }

  if (query.length < 2) {
    return NextResponse.json({ results: [] as WebSearchItem[] });
  }

  const raw = await searchTmdbMulti(query, 1, true);
  const results = raw
    .filter((item) => item.poster_path || item.backdrop_path || item.profile_path)
    .map<WebSearchItem>((item) => {
      if (item.media_type === "person") {
        return {
          mediaId: `person-${item.id}`,
          mediaType: "movie",
          isPerson: true,
          tmdbId: item.id,
          title: item.name || "Personnalité",
          subtitle: item.known_for_department || "Acteur / Actrice",
          posterUrl: tmdbImageUrl(item.profile_path, "w342"),
          backdropUrl: null,
          overview: null,
          department: item.known_for_department || "Acteur / Actrice"
        };
      }

      const mediaType = item.media_type === "tv" ? "tv" : "movie";
      return {
        mediaId: encodeMediaId(mediaType, item.id),
        mediaType,
        isPerson: false,
        tmdbId: item.id,
        title: item.title || item.name || "Contenu MegaTv",
        subtitle: (item.release_date || item.first_air_date || "").slice(0, 4) || null,
        posterUrl: tmdbImageUrl(item.poster_path, "w342"),
        backdropUrl: tmdbBackdropUrl(item.backdrop_path),
        overview: item.overview || null,
        voteAverage: typeof item.vote_average === "number" && item.vote_average > 0 ? Math.round(item.vote_average * 10) / 10 : null
      };
    })
    .slice(0, 50);

  return NextResponse.json({ results });
}
