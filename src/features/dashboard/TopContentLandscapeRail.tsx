"use client";

import { LandscapeMediaRail, type LandscapeCardItem } from "@/features/companion/ui/LandscapeMediaRail";
import { formatDuration } from "@/lib/format";
import type { TopContentRow } from "@/lib/supabase/types";

export function TopContentLandscapeRail({ items }: { items: TopContentRow[] }) {
  const railItems: LandscapeCardItem[] = items.slice(0, 12).map((item, index) => ({
    id: `${item.media_type}-${item.tmdb_id}-${index}`,
    title: item.title || item.episode_title || `TMDB ${item.tmdb_id}`,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    mediaType: item.media_type,
    tmdbId: item.tmdb_id,
    meta: `${item.media_type === "tv" ? "Série" : "Film"} · ${formatDuration(Number(item.watch_seconds || 0))} cumulés`
  }));

  if (railItems.length === 0) {
    return <p className="text-sm text-[var(--mega-text-faint)]">Aucun top contenu pour le moment.</p>;
  }

  return (
    <LandscapeMediaRail
      title="Top contenus"
      subtitle="Classement par temps de visionnage cumulé — posters paysage."
      items={railItems}
    />
  );
}
