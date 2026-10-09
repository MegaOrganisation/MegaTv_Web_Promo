import { fetchTmdbProxyPublic, tmdbImageUrl } from "@/lib/tmdb";
import type { CollectionTile } from "@/lib/web/collection-tiles";
import type { WebMediaItem } from "@/lib/web/media";

type DiscoverRow = {
  id?: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

async function discover(
  mediaType: "movie" | "tv",
  params: Record<string, string>
): Promise<WebMediaItem[]> {
  const data = (await fetchTmdbProxyPublic(`/discover/${mediaType}`, "", {
    ...params,
    sort_by: "popularity.desc",
    include_adult: "false",
    page: "1"
  }, 60 * 60 * 6)) as { results?: DiscoverRow[] } | null;

  return (data?.results || [])
    .filter((row) => Number(row.id) > 0)
    .slice(0, 24)
    .map((row) => {
      const id = Number(row.id);
      const title = row.title || row.name || "Sans titre";
      const year = (row.release_date || row.first_air_date || "").slice(0, 4) || null;
      return {
        mediaId: `${mediaType}-${id}`,
        mediaType,
        tmdbId: id,
        title,
        subtitle: year,
        posterUrl: tmdbImageUrl(row.poster_path, "w342"),
        backdropUrl: tmdbImageUrl(row.backdrop_path, "w780"),
        rating: typeof row.vote_average === "number" && row.vote_average > 0 ? Math.round(row.vote_average * 10) / 10 : null
      } satisfies WebMediaItem;
    });
}

/** TMDB discover for a web collection tile (watch provider / genre / company). */
export async function discoverCollectionItems(tile: CollectionTile): Promise<WebMediaItem[]> {
  const hint = tile.tmdb;
  if (!hint) return [];

  const types: Array<"movie" | "tv"> =
    hint.mediaType === "movie" ? ["movie"] : hint.mediaType === "tv" ? ["tv"] : ["movie", "tv"];

  const batches = await Promise.all(
    types.map(async (mediaType) => {
      const params: Record<string, string> = {};
      if (hint.watchProviderId) {
        params.with_watch_providers = String(hint.watchProviderId);
        params.watch_region = "US";
      }
      if (hint.genreId) params.with_genres = String(hint.genreId);
      if (hint.companyId) params.with_companies = String(hint.companyId);
      if (Object.keys(params).length === 0) return [] as WebMediaItem[];
      return discover(mediaType, params);
    })
  );

  const seen = new Set<string>();
  const out: WebMediaItem[] = [];
  for (const item of batches.flat()) {
    if (seen.has(item.mediaId)) continue;
    seen.add(item.mediaId);
    out.push(item);
    if (out.length >= 36) break;
  }
  return out;
}
