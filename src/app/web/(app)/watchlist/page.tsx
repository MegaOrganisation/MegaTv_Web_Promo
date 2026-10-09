import { redirect } from "next/navigation";

import { WatchlistClient } from "@/features/web/watchlist/WatchlistClient";
import { WATCHLIST_DOCUMENTARY_GENRE_ID } from "@/features/web/watchlist/constants";
import type { EnrichedWatchlistItem } from "@/features/web/watchlist/types";
import { getWatchlistForProfile, type WatchlistItem } from "@/lib/dashboard/watch-data";
import { fetchTmdbSummary, tmdbBackdropUrl, tmdbImageUrl } from "@/lib/tmdb";
import { encodeMediaId } from "@/lib/web/media";

export const dynamic = "force-dynamic";

const enrichmentCache = new Map<string, Partial<EnrichedWatchlistItem>>();

async function enrichItems(items: WatchlistItem[]): Promise<EnrichedWatchlistItem[]> {
  const BATCH_SIZE = 30;
  const target = items.slice(0, BATCH_SIZE);
  const remainder = items.slice(BATCH_SIZE);

  const enrichedTarget = await Promise.all(
    target.map(async (item) => {
      const cacheKey = `${item.mediaType}:${item.tmdbId}`;
      const cached = enrichmentCache.get(cacheKey);

      if (cached) {
        return {
          mediaId: encodeMediaId(item.mediaType, item.tmdbId),
          mediaType: item.mediaType,
          tmdbId: item.tmdbId,
          title: item.title,
          subtitle: cached.releaseYear ? String(cached.releaseYear) : null,
          posterUrl: cached.posterUrl || tmdbImageUrl(item.posterPath, "w342"),
          backdropUrl: cached.backdropUrl || tmdbBackdropUrl(item.backdropPath),
          addedAt: item.addedAt || 0,
          ...cached
        } as EnrichedWatchlistItem;
      }

      try {
        const details = await fetchTmdbSummary(item.mediaType, item.tmdbId);
        const genres = (details?.genres || []).map((g) => g.name);
        const genreIds = (details?.genres || []).map((g) => g.id);
        const isDoc =
          genreIds.includes(WATCHLIST_DOCUMENTARY_GENRE_ID) ||
          item.title.toLowerCase().includes("documentaire") ||
          (details?.overview || "").toLowerCase().includes("documentaire");
        const dateStr = details?.release_date || details?.first_air_date || "";
        const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : null;
        const runtime =
          details?.runtime ||
          (details?.episode_run_time && details.episode_run_time[0]) ||
          (item.mediaType === "movie" ? 110 : 45);

        const patch: Partial<EnrichedWatchlistItem> = {
          genres,
          genreIds,
          isDocumentary: isDoc,
          releaseYear: Number.isFinite(year) ? year : null,
          runtime: runtime || (item.mediaType === "movie" ? 110 : 45),
          voteAverage:
            typeof details?.vote_average === "number" && details.vote_average > 0
              ? Math.round(details.vote_average * 10) / 10
              : null,
          overview: details?.overview || null
        };

        enrichmentCache.set(cacheKey, patch);

        return {
          mediaId: encodeMediaId(item.mediaType, item.tmdbId),
          mediaType: item.mediaType,
          tmdbId: item.tmdbId,
          title: details?.title || details?.name || item.title,
          subtitle: year ? String(year) : null,
          posterUrl: tmdbImageUrl(details?.poster_path || item.posterPath, "w342"),
          backdropUrl: tmdbBackdropUrl(details?.backdrop_path || item.backdropPath),
          addedAt: item.addedAt || 0,
          ...patch
        } as EnrichedWatchlistItem;
      } catch {
        return {
          mediaId: encodeMediaId(item.mediaType, item.tmdbId),
          mediaType: item.mediaType,
          tmdbId: item.tmdbId,
          title: item.title,
          subtitle: null,
          posterUrl: tmdbImageUrl(item.posterPath, "w342"),
          backdropUrl: tmdbBackdropUrl(item.backdropPath),
          addedAt: item.addedAt || 0,
          genres: [],
          genreIds: [],
          isDocumentary: false,
          releaseYear: null,
          runtime: item.mediaType === "movie" ? 110 : 45,
          voteAverage: null
        } as EnrichedWatchlistItem;
      }
    })
  );

  const fallbackRemainder = remainder.map<EnrichedWatchlistItem>((item) => ({
    mediaId: encodeMediaId(item.mediaType, item.tmdbId),
    mediaType: item.mediaType,
    tmdbId: item.tmdbId,
    title: item.title,
    subtitle: null,
    posterUrl: tmdbImageUrl(item.posterPath, "w342"),
    backdropUrl: tmdbBackdropUrl(item.backdropPath),
    addedAt: item.addedAt || 0,
    genres: [],
    genreIds: [],
    isDocumentary: false,
    releaseYear: null,
    runtime: item.mediaType === "movie" ? 110 : 45,
    voteAverage: null
  }));

  return [...enrichedTarget, ...fallbackRemainder];
}

export default async function WebWatchlistPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const profileId = (await searchParams).profile?.trim();
  if (!profileId) redirect("/web");

  // Profile-scoped slice read (v_account_sync_watchlist)
  const { items } = await getWatchlistForProfile(profileId);
  const enrichedMedia = await enrichItems(items);

  return (
    <div className="space-y-6">
      <h1 className="px-1 text-2xl font-bold text-[var(--mega-text)]">Ma liste</h1>
      <WatchlistClient initialItems={enrichedMedia} profileId={profileId} />
    </div>
  );
}
