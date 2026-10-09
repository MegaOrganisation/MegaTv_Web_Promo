import type { WebMediaItem } from "@/lib/web/media";

export type WatchlistTypeFilter = "all" | "movie" | "tv" | "documentary";
export type WatchlistWatchedFilter = "all" | "unwatched" | "watched";
export type WatchlistSortOption = "date_added" | "rating" | "title" | "year";

export type EnrichedWatchlistItem = WebMediaItem & {
  addedAt?: number;
  voteAverage?: number | null;
  releaseYear?: number | null;
  runtime?: number | null;
  genres?: string[];
  genreIds?: number[];
  isDocumentary?: boolean;
};

export type WatchlistStats = {
  total: number;
  movies: number;
  series: number;
  documentaries: number;
  totalMinutes: number;
  estimatedHours: number;
  estimatedMinutesRemainder: number;
};
