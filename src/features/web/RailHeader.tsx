"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

export function RailHeader({
  title,
  showSeeAll,
  onSeeAll,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  showNav = true
}: {
  title: string;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  canScrollLeft?: boolean;
  canScrollRight?: boolean;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  showNav?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div className="flex min-w-0 items-center gap-2">
        <span className="mega-rail-bar h-[18px] w-1 shrink-0 rounded-sm bg-white/90" aria-hidden />
        <h2 className="truncate text-lg font-bold text-[var(--mega-text)]">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {showSeeAll && onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="focus-ring rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--mega-text-muted)] transition hover:bg-white/5 hover:text-[var(--mega-text)]"
          >
            Voir tout
          </button>
        ) : null}
        {showNav ? (
          <>
            <button
              type="button"
              aria-label="Défiler à gauche"
              disabled={!canScrollLeft}
              onClick={onScrollLeft}
              className={clsx(
                "focus-ring grid h-8 w-8 place-items-center rounded-full border border-[var(--mega-border)] transition",
                canScrollLeft
                  ? "text-[var(--mega-text)] hover:border-[var(--mega-border-strong)] hover:bg-white/5"
                  : "cursor-not-allowed text-[var(--mega-text-faint)] opacity-40"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Défiler à droite"
              disabled={!canScrollRight}
              onClick={onScrollRight}
              className={clsx(
                "focus-ring grid h-8 w-8 place-items-center rounded-full border border-[var(--mega-border)] transition",
                canScrollRight
                  ? "text-[var(--mega-text)] hover:border-[var(--mega-border-strong)] hover:bg-white/5"
                  : "cursor-not-allowed text-[var(--mega-text-faint)] opacity-40"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
