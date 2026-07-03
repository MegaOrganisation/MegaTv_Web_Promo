import type { ReactNode } from "react";

/**
 * Top 10 rail cell — large rank glyph left of poster with 10px overlap
 * (parity with Android `MobileTop10RankGlyph` + `mobileTop10CardOverlap`).
 */
export function Top10RailCell({ rank, children }: { rank: number; children: ReactNode }) {
  return (
    <div className="top10-rail-cell relative flex shrink-0 items-end overflow-visible">
      <span aria-hidden className="top10-number" data-rank={rank}>
        {rank}
      </span>
      <div className="top10-poster-slot">{children}</div>
    </div>
  );
}
