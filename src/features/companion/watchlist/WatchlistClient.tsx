"use client";

import { clsx } from "clsx";
import { Star, X } from "lucide-react";

import { MobileModalOverlay } from "@/components/ui/MobileModalOverlay";
import type { WatchlistItem } from "@/lib/dashboard/watch-data";

export type WatchlistDetail = {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  episodeTitle?: string | null;
  season?: number;
  episode?: number;
  overview?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  runtime?: string | null;
  rating?: number | null;
  releaseDate?: string | null;
  cast?: { id: number; name: string; character?: string | null; photoUrl?: string | null }[];
};

type Props = {
  open: boolean;
  item: WatchlistItem | null;
  detail: WatchlistDetail | null;
  loading: boolean;
  onClose: () => void;
};

export function WatchlistDetailModal({ open, item, detail, loading, onClose }: Props) {
  if (!open || !item) return null;

  const title = detail?.title || item.title;
  const subtitle =
    detail?.mediaType === "tv" && detail.season && detail.episode
      ? `S${detail.season}E${detail.episode}${detail.episodeTitle ? ` · ${detail.episodeTitle}` : ""}`
      : detail?.mediaType === "tv"
        ? "Série"
        : "Film";

  return (
    <MobileModalOverlay open={open} onClose={onClose}>
      <div
        className="mega-glass flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[var(--mega-border)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-40 shrink-0 overflow-hidden sm:h-48">
          {detail?.backdropUrl ? (
            <img src={detail.backdropUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--mega-card-bg)] to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="focus-ring absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            {detail?.posterUrl ? (
              <img src={detail.posterUrl} alt="" className="h-28 w-[4.5rem] shrink-0 rounded-xl object-cover shadow-2xl" />
            ) : null}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{subtitle}</p>
              <h2 className="truncate text-2xl font-bold text-white">{title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                {detail?.rating ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                    <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    {detail.rating.toFixed(1)}/10
                  </span>
                ) : null}
                {detail?.runtime ? <span>{detail.runtime}</span> : null}
                {detail?.releaseDate ? <span>{new Date(detail.releaseDate).getFullYear()}</span> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {loading ? <p className="text-sm text-[var(--mega-text-muted)]">Chargement des détails TMDB…</p> : null}
          {detail?.overview ? <p className="text-sm leading-6 text-[var(--mega-text-muted)]">{detail.overview}</p> : null}

          {detail?.cast && detail.cast.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-[var(--mega-text)]">Distribution</h3>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {detail.cast.map((actor) => (
                  <div key={actor.id} className="w-20 shrink-0 text-center">
                    {actor.photoUrl ? (
                      <img src={actor.photoUrl} alt="" className="mx-auto h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--mega-border)] text-[10px] text-[var(--mega-text-faint)]">
                        ?
                      </div>
                    )}
                    <p className="mt-2 truncate text-[11px] font-semibold text-[var(--mega-text)]">{actor.name}</p>
                    {actor.character ? (
                      <p className="truncate text-[10px] text-[var(--mega-text-faint)]">{actor.character}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </MobileModalOverlay>
  );
}

export function WatchlistThumb({
  title,
  posterUrl,
  mediaType,
  onClick
}: {
  title: string;
  posterUrl?: string | null;
  mediaType: "movie" | "tv";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group overflow-hidden rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-left transition",
        "hover:border-[var(--mega-accent)]/40 hover:shadow-lg"
      )}
    >
      {posterUrl ? (
        <img src={posterUrl} alt={title} className="aspect-[2/3] w-full object-cover transition group-hover:scale-[1.03]" loading="lazy" />
      ) : (
        <div className="grid aspect-[2/3] w-full place-items-center text-[10px] text-[var(--mega-text-faint)]">
          {mediaType === "tv" ? "Série" : "Film"}
        </div>
      )}
      <div className="p-2">
        <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-[var(--mega-text)]">{title}</p>
      </div>
    </button>
  );
}
