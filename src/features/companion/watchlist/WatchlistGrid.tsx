"use client";

import { useState } from "react";

import { WatchlistDetailModal, WatchlistThumb, type WatchlistDetail } from "@/features/companion/watchlist/WatchlistClient";
import type { WatchlistItem } from "@/lib/dashboard/watch-data";

type EnrichedItem = WatchlistItem & {
  posterUrl?: string | null;
};

export function WatchlistGrid({ items }: { items: EnrichedItem[] }) {
  const [selected, setSelected] = useState<EnrichedItem | null>(null);
  const [detail, setDetail] = useState<WatchlistDetail | null>(null);
  const [loading, setLoading] = useState(false);

  async function openItem(item: EnrichedItem) {
    setSelected(item);
    setDetail(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        media_type: item.mediaType,
        tmdb_id: String(item.tmdbId)
      });
      const response = await fetch(`/api/tmdb/enrich?${params.toString()}`);
      const json = (await response.json()) as WatchlistDetail;
      if (response.ok) setDetail(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
        {items.map((item) => (
          <WatchlistThumb
            key={`${item.mediaType}-${item.tmdbId}`}
            title={item.title}
            posterUrl={item.posterUrl}
            mediaType={item.mediaType}
            onClick={() => openItem(item)}
          />
        ))}
      </div>
      <WatchlistDetailModal
        open={selected != null}
        item={selected}
        detail={detail}
        loading={loading}
        onClose={() => {
          setSelected(null);
          setDetail(null);
        }}
      />
    </>
  );
}
