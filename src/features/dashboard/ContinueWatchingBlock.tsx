"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { motion } from "motion/react";

import { MegaTvIcon } from "@/components/icons/MegaTvIcon";
import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";
import { ScrollableRail } from "@/features/companion/ui/ScrollableRail";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import type { ContinueWatchingRow } from "@/lib/supabase/types";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";

function RailContinueCard({ item, index }: { item: ContinueWatchingRow; index: number }) {
  const media = useMediaDetailOptional();
  const backdrop = tmdbProxiedImageUrl(item.backdrop_path || item.poster_path, "w500");
  const poster = tmdbProxiedImageUrl(item.poster_path, "w185");
  const layoutId = `media-${item.media_type}-${item.tmdb_id}`;
  const meta =
    item.media_type === "tv" && item.season
      ? `S${item.season} · E${item.episode ?? 1}${item.episode_title ? ` — ${item.episode_title}` : ""}`
      : item.media_type === "tv"
        ? "Série"
        : "Film";
  const progress =
    item.progress != null && item.progress > 0
      ? Math.min(99, Math.round(item.progress <= 1 ? item.progress * 100 : item.progress))
      : null;

  function openDetail() {
    if (!item.tmdb_id) return;
    media?.openMediaDetail({
      mediaType: item.media_type as "movie" | "tv",
      tmdbId: item.tmdb_id,
      title: item.title || `TMDB ${item.tmdb_id}`,
      posterUrl: poster,
      backdropUrl: backdrop,
      meta,
      layoutId
    });
  }

  return (
    <motion.article
      className="rail-cw-infuse text-left"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...cinemaSpringSnappy, delay: index * 0.04 }}
    >
      <div className="rail-cw-infuse__shell">
        {backdrop ? (
          <div className="rail-cw-infuse__backdrop" aria-hidden>
            <CompanionCanvasImg src={backdrop} alt="" className="rail-cw-infuse__backdrop-img" />
          </div>
        ) : null}
        <button
          type="button"
          className="rail-cw-infuse__poster rail-cw-infuse__poster--hit focus-ring group"
          onClick={openDetail}
          aria-label={`Ouvrir ${item.title || `TMDB ${item.tmdb_id}`}`}
        >
          <motion.div layoutId={layoutId} className="rail-cw-infuse__poster-zoom">
            {poster ? (
              <CompanionCanvasImg src={poster} alt="" className="rail-cw-infuse__poster-img" />
            ) : (
              <div className="rail-cw-infuse__poster-fallback">
                <Play className="h-5 w-5 fill-white/40 text-white/40" />
              </div>
            )}
          </motion.div>
        </button>
        <div className="rail-cw-infuse__meta">
          <button type="button" className="rail-cw-infuse__title-btn" onClick={openDetail}>
            <p className="rail-cw-infuse__title">{item.title || `TMDB ${item.tmdb_id}`}</p>
          </button>
          <p className="rail-cw-infuse__sub">
            <Play className="h-3 w-3 shrink-0 fill-current" />
            <span className="truncate">{meta}</span>
          </p>
          <div className="rail-cw-infuse__progress" aria-hidden>
            <div className="rail-cw-infuse__progress-fill" style={{ width: `${progress ?? 8}%` }} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/** Bloc Reprendre — utilisable comme encart dashboard (layout éditable). */
export function ContinueWatchingBlock({ items }: { items: ContinueWatchingRow[] }) {
  const { withProfile } = useCompanionProfile();
  const list = items.slice(0, 8);

  return (
    <div className="cinema-rail-panel cinema-rail-panel--block h-full">
      <h2 className="mega-cinema-rail-title">Reprendre</h2>
      {list.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--mega-text-muted)]">Aucune reprise pour ce profil.</p>
      ) : (
        <ScrollableRail axis="y" className="mt-3 max-h-[min(52vh,520px)] space-y-2.5 overflow-y-auto">
          {list.map((item, index) => (
            <RailContinueCard key={item.track_id} item={item} index={index} />
          ))}
        </ScrollableRail>
      )}
      <div className="cinema-rail-panel__footer mt-auto flex flex-wrap items-center gap-2 pt-3">
        <Link
          href={withProfile("/companion/calendar")}
          className="focus-ring cinema-rail-link inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
        >
          <MegaTvIcon name="calendar" size={15} />
          Calendrier
        </Link>
        <Link
          href={withProfile("/companion/devices")}
          className="focus-ring cinema-rail-link inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mega-text-muted)] hover:text-[var(--brand-gold)]"
        >
          <MegaTvIcon name="cast" size={15} />
          Sur TV
        </Link>
      </div>
    </div>
  );
}
