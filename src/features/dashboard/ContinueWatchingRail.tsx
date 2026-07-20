"use client";

import { useEffect, useMemo, useState } from "react";

import { LandscapeMediaRail, type LandscapeCardItem } from "@/features/companion/ui/LandscapeMediaRail";
import { formatDate } from "@/lib/format";
import type { ContinueWatchingRow } from "@/lib/supabase/types";

type EnrichedItem = ContinueWatchingRow & {
  enrichedTitle?: string | null;
  enrichedPoster?: string | null;
  enrichedBackdrop?: string | null;
};

function progressPercent(item: ContinueWatchingRow) {
  const raw = item.progress;
  if (raw != null && raw > 0) {
    return Math.min(99, Math.round(raw <= 1 ? raw * 100 : raw));
  }
  if (item.progress_seconds && item.total_duration_seconds) {
    return Math.min(99, Math.round((item.progress_seconds / item.total_duration_seconds) * 100));
  }
  return null;
}

function subtitle(item: ContinueWatchingRow) {
  if (item.media_type === "tv" && item.season) {
    const ep = item.episode ?? 1;
    return item.episode_title ? `S${item.season} · E${ep} — ${item.episode_title}` : `S${item.season} · E${ep}`;
  }
  return item.media_type === "tv" ? "Série" : "Film";
}

export function ContinueWatchingRail({ items, lastActivityAt }: { items: ContinueWatchingRow[]; lastActivityAt?: string | null }) {
  const [enriched, setEnriched] = useState<EnrichedItem[]>(items);

  useEffect(() => {
    setEnriched(items);
    let cancelled = false;

    const targets = items.filter((item) => item.tmdb_id && (!item.poster_path || !item.backdrop_path || !item.title));
    if (targets.length === 0) return;

    void Promise.all(
      targets.map(async (item) => {
        const params = new URLSearchParams({
          media_type: item.media_type,
          tmdb_id: String(item.tmdb_id)
        });
        const response = await fetch(`/api/tmdb/enrich?${params.toString()}`);
        if (!response.ok) return null;
        const body = (await response.json()) as { title?: string; posterUrl?: string | null; backdropUrl?: string | null };
        return {
          key: item.track_id,
          title: body.title || null,
          posterUrl: body.posterUrl || null,
          backdropUrl: body.backdropUrl || null
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
            poster_path: item.poster_path || patch.posterUrl,
            backdrop_path: item.backdrop_path || patch.backdropUrl,
            enrichedTitle: patch.title,
            enrichedPoster: patch.posterUrl,
            enrichedBackdrop: patch.backdropUrl
          };
        })
      );
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const railItems = useMemo<LandscapeCardItem[]>(
    () =>
      enriched.slice(0, 12).map((item) => ({
        id: item.track_id,
        title: item.title || item.enrichedTitle || `TMDB ${item.tmdb_id}`,
        posterPath: item.poster_path || item.enrichedPoster,
        backdropPath: item.backdrop_path || item.enrichedBackdrop,
        mediaType: item.media_type,
        meta: subtitle(item),
        progressPercent: progressPercent(item),
        tmdbId: item.tmdb_id
      })),
    [enriched]
  );

  if (railItems.length === 0) {
    return (
      <div className="mega-liquid-glass mega-liquid-glass-panel rounded-[28px] border border-dashed border-[var(--mega-cp-border)] p-8 text-center">
        <p className="font-semibold text-[var(--mega-text)]">Aucune reprise de lecture</p>
        <p className="mt-2 text-sm text-[var(--mega-text-muted)]">Les contenus repris dans MegaTv apparaîtront ici dès que la synchronisation Cloud aura des données.</p>
      </div>
    );
  }

  return (
    <LandscapeMediaRail
      title="Continuer à regarder"
      subtitle="Rails paysage visionOS — survolez pour teinter le fond."
      items={railItems}
      endSlot={
        lastActivityAt ? (
          <span className="rounded-full border border-[var(--mega-cp-border)] bg-[var(--mega-card-bg)] px-3 py-1 text-xs text-[var(--mega-text-faint)]">
            {formatDate(lastActivityAt)}
          </span>
        ) : null
      }
    />
  );
}
