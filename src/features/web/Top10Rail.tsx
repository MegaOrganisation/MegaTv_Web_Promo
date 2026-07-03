"use client";

import { PosterCard } from "@/features/web/PosterCard";
import { Top10RailCell } from "@/features/web/Top10RailCell";
import type { WebMediaItem } from "@/lib/web/media";

/**
 * "Top 10" rail — large stylised outlined rank numbers behind each poster
 * (Netflix-style), used only for the trending / top rail on Home. Always renders
 * portrait posters regardless of the profile layout preference so the numbers
 * read clearly. Reuses PosterCard for hover/trailer/context-menu parity.
 */
export function Top10Rail({ title, items }: { title: string; items: WebMediaItem[] }) {
  const top = items.slice(0, 10);
  if (top.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-lg font-bold text-[var(--mega-text)]">{title}</h2>
      <div className="mega-rail-track">
        {top.map((item, index) => (
          <Top10RailCell key={`top10-${item.mediaId}`} rank={index + 1}>
            <PosterCard item={item} layout="poster" />
          </Top10RailCell>
        ))}
      </div>
    </section>
  );
}
