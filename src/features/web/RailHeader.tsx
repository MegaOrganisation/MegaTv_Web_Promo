"use client";

import { ChevronLeft } from "lucide-react";
import { clsx } from "clsx";

export function RailHeader({
  title,
  hasMore,
  atEnd,
  onSeeAll,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  showNav = true
}: {
  title: string;
  hasMore?: boolean;
  atEnd?: boolean;
  onSeeAll?: () => void;
  canScrollLeft?: boolean;
  canScrollRight?: boolean;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  showNav?: boolean;
}) {
  const showSeeAllMorph = Boolean(hasMore && atEnd && onSeeAll);
  const showScrollRight = Boolean(showNav && !showSeeAllMorph);

  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div className="flex min-w-0 items-center gap-2">
        <span className="mega-rail-bar h-[18px] w-1 shrink-0 rounded-sm bg-white/90" aria-hidden />
        <h2 className="truncate text-lg font-bold text-[var(--mega-text)]">{title}</h2>
      </div>
      {showNav ? (
        <div className="flex shrink-0 items-center gap-1">
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

          {showSeeAllMorph ? (
            <button
              type="button"
              onClick={onSeeAll}
              className="mega-rail-seeall-morph mega-rail-seeall-morph--expanded focus-ring"
              aria-label="Voir tout le catalogue"
            >
              <span className="mega-rail-seeall-morph-label">Voir tout</span>
            </button>
          ) : null}

          {showScrollRight ? (
            <button
              type="button"
              aria-label="Défiler à droite"
              disabled={!canScrollRight}
              onClick={onScrollRight}
              className={clsx(
                "focus-ring mega-rail-seeall-morph grid h-8 w-8 place-items-center rounded-full border border-[var(--mega-border)] transition",
                canScrollRight
                  ? "text-[var(--mega-text)] hover:border-[var(--mega-border-strong)] hover:bg-white/5"
                  : "cursor-not-allowed text-[var(--mega-text-faint)] opacity-40"
              )}
            >
              <ChevronRightIcon />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
