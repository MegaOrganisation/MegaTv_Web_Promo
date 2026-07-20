"use client";

import { Calendar, Clock, Film, Star, Tv } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";

import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import type { WatchlistItem } from "@/lib/dashboard/watch-data";

export type EnrichedWatchlistItem = WatchlistItem & {
  posterUrl?: string | null;
  backdropUrl?: string | null;
  genreLabel?: string | null;
  rating?: number | null;
  year?: string | null;
  runtime?: string | null;
};

/** Watchlist style pj3 — carte horizontale poster réduit + meta glass. */
export function WatchlistCinematicGrid({ items }: { items: EnrichedWatchlistItem[] }) {
  const media = useMediaDetailOptional();

  return (
    <div className="wl-list">
      {items.map((item, index) => {
        const layoutId = `media-${item.mediaType}-${item.tmdbId}`;
        const meta = item.genreLabel || (item.mediaType === "tv" ? "Série" : "Film");
        return (
          <motion.button
            key={`${item.mediaType}-${item.tmdbId}`}
            type="button"
            className="wl-row focus-ring text-left"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...cinemaSpringSnappy, delay: Math.min(index * 0.04, 0.35) }}
            whileHover={{ y: -2 }}
            onClick={() => {
              media?.openMediaDetail({
                mediaType: item.mediaType,
                tmdbId: item.tmdbId,
                title: item.title,
                posterUrl: item.posterUrl,
                backdropUrl: item.backdropUrl,
                meta,
                layoutId
              });
            }}
          >
            <motion.div layoutId={layoutId} className="wl-row__poster">
              {item.posterUrl ? (
                <CompanionCanvasImg src={item.posterUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center bg-[#12161a] text-white/35">
                  {item.mediaType === "tv" ? <Tv className="h-6 w-6" /> : <Film className="h-6 w-6" />}
                </div>
              )}
            </motion.div>
            <div className="wl-row__body">
              <p className="wl-row__chip">{item.mediaType === "tv" ? "Série" : "Film"}</p>
              <h3 className="wl-row__title">{item.title}</h3>
              {item.genreLabel ? <p className="wl-row__genre">{item.genreLabel}</p> : null}
              <div className="wl-row__meta">
                {item.rating != null ? (
                  <span>
                    <Star className="mr-1 inline h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    {item.rating.toFixed(1)}
                  </span>
                ) : null}
                {item.year ? (
                  <span>
                    <Calendar className="mr-1 inline h-3.5 w-3.5 opacity-60" />
                    {item.year}
                  </span>
                ) : null}
                {item.runtime ? (
                  <span>
                    <Clock className="mr-1 inline h-3.5 w-3.5 opacity-60" />
                    {item.runtime}
                  </span>
                ) : null}
              </div>
            </div>
            <span className={clsx("wl-row__cta")}>Détail →</span>
          </motion.button>
        );
      })}
    </div>
  );
}
