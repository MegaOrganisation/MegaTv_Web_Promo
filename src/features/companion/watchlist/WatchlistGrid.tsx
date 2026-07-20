"use client";

import { WatchlistCinematicGrid, type EnrichedWatchlistItem } from "@/features/companion/watchlist/WatchlistCinematicGrid";

/** Watchlist — rows horizontales style pj3. */
export function WatchlistGrid({ items }: { items: EnrichedWatchlistItem[] }) {
  return <WatchlistCinematicGrid items={items} />;
}
