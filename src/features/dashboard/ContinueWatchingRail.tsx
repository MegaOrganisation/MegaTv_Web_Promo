"use client";

import { useEffect, useMemo, useState } from "react";

import { PosterMetricRow } from "@/features/dashboard/PosterMetricRow";
import type { ContinueWatchingRow } from "@/lib/supabase/types";

type EnrichedItem = ContinueWatchingRow & {
  enrichedTitle?: string | null;
  enrichedPoster?: string | null;
};

export function ContinueWatchingRail({ items }: { items: ContinueWatchingRow[] }) {
  const [enriched, setEnriched] = useState<EnrichedItem[]>(items);

  useEffect(() => {
    setEnriched(items);
    let cancelled = false;

    const targets = items.filter((item) => item.tmdb_id && (!item.poster_path || !item.title));
    if (targets.length === 0) return;

    void Promise.all(
      targets.map(async (item) => {
        const params = new URLSearchParams({
          media_type: item.media_type,
          tmdb_id: String(item.tmdb_id)
        });
        const response = await fetch(`/api/tmdb/enrich?${params.toString()}`);
        if (!response.ok) return null;
        const body = (await response.json()) as { title?: string; posterUrl?: string | null };
        return {
          key: item.track_id,
          title: body.title || null,
          posterUrl: body.posterUrl || null
        };
      })
    ).then((results) => {
      if (cancelled) return;
      const byKey = new Map(results.filter(Boolean).map((row) => [row!.key, row!]));
      setEnriched(
        items.map((item) => {
          const patch = byKey.get(item.track_id);
          if (!patch) return item;
          return {
            ...item,
            title: item.title || patch.title,
            enrichedTitle: patch.title,
            poster_path: item.poster_path || patch.posterUrl,
            enrichedPoster: patch.posterUrl
          };
        })
      );
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const displayItems = useMemo(() => enriched, [enriched]);

  if (displayItems.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/14 bg-white/[0.025] p-8 text-center">
        <p className="font-semibold text-white">Aucune reprise de lecture</p>
        <p className="mt-2 text-sm text-white/45">Les contenus repris dans MegaTv apparaîtront ici dès que la synchronisation Cloud aura des données.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {displayItems.slice(0, 8).map((item, index) => (
        <PosterMetricRow key={item.track_id} item={item} rank={index + 1} />
      ))}
    </div>
  );
}
