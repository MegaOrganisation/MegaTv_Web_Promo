"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";

import { MegaTvIcon } from "@/components/icons/MegaTvIcon";
import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";
import { ScrollableRail } from "@/features/companion/ui/ScrollableRail";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import type { ContinueWatchingRow } from "@/lib/supabase/types";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";

function resolvePosterSources(item: ContinueWatchingRow) {
  const poster = tmdbProxiedImageUrl(item.poster_path, "w185");
  const backdrop = tmdbProxiedImageUrl(item.backdrop_path || item.poster_path, "w500");
  const still = tmdbProxiedImageUrl(item.backdrop_path, "w300");
  const candidates = [poster, still, backdrop].filter((v): v is string => Boolean(v));
  return {
    primary: candidates[0] || null,
    fallbacks: candidates.slice(1),
    backdrop: backdrop || still || poster
  };
}

function RailContinueCard({ item, index }: { item: ContinueWatchingRow; index: number }) {
  const media = useMediaDetailOptional();
  const { primary, fallbacks, backdrop } = resolvePosterSources(item);
  const [imgSrc, setImgSrc] = useState<string | null>(primary);
  const [imgFailed, setImgFailed] = useState(false);
  // Préfixe dédié dashboard — évite collision layoutId avec le rail latéral.
  const layoutId = `cw-dash-${item.media_type}-${item.tmdb_id}`;
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

  useEffect(() => {
    setImgSrc(primary);
    setImgFailed(false);
  }, [primary, item.track_id]);

  function openDetail() {
    if (!item.tmdb_id || !media) return;
    media.openMediaDetail({
      mediaType: item.media_type as "movie" | "tv",
      tmdbId: item.tmdb_id,
      title: item.title || `TMDB ${item.tmdb_id}`,
      posterUrl: imgSrc || primary,
      backdropUrl: backdrop,
      meta,
      layoutId
    });
  }

  return (
    <motion.button
      type="button"
      className="rail-cw-infuse text-left"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...cinemaSpringSnappy, delay: index * 0.04 }}
      onClick={openDetail}
      aria-label={`Ouvrir ${item.title || `TMDB ${item.tmdb_id}`}`}
    >
      <div className="rail-cw-infuse__shell">
        {backdrop ? (
          <div className="rail-cw-infuse__backdrop" aria-hidden>
            <CompanionCanvasImg src={backdrop} alt="" className="rail-cw-infuse__backdrop-img" />
          </div>
        ) : null}
        <div className="rail-cw-infuse__poster rail-cw-infuse__poster--hit">
          <motion.div layoutId={layoutId} className="rail-cw-infuse__poster-zoom">
            {imgSrc && !imgFailed ? (
              <CompanionCanvasImg
                src={imgSrc}
                alt=""
                className="rail-cw-infuse__poster-img"
                onError={() => {
                  const next = fallbacks.find((url) => url !== imgSrc);
                  if (next) {
                    setImgSrc(next);
                    return;
                  }
                  setImgFailed(true);
                }}
              />
            ) : (
              <div className="rail-cw-infuse__poster-fallback">
                <Play className="h-5 w-5 fill-white/40 text-white/40" />
              </div>
            )}
          </motion.div>
        </div>
        <div className="rail-cw-infuse__meta">
          <p className="rail-cw-infuse__title">{item.title || `TMDB ${item.tmdb_id}`}</p>
          <p className="rail-cw-infuse__sub">
            <Play className="h-3 w-3 shrink-0 fill-current" />
            <span className="truncate">{meta}</span>
          </p>
          <div className="rail-cw-infuse__progress" aria-hidden>
            <div className="rail-cw-infuse__progress-fill" style={{ width: `${progress ?? 8}%` }} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/** Bloc Reprendre — utilisable comme encart dashboard (layout éditable). */
export function ContinueWatchingBlock({ items }: { items: ContinueWatchingRow[] }) {
  const { withProfile } = useCompanionProfile();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const list = items.slice(0, compact ? 4 : 8);

  return (
    <div className="cinema-rail-panel cinema-rail-panel--block h-full">
      <h2 className="mega-cinema-rail-title">Reprendre</h2>
      {list.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--mega-text-muted)]">Aucune reprise pour ce profil.</p>
      ) : (
        <ScrollableRail
          axis="y"
          className={clsx(
            "mt-3 space-y-2.5 overflow-y-auto",
            compact ? "max-h-[min(42vh,320px)]" : "max-h-[min(52vh,520px)]"
          )}
        >
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
          href={withProfile("/companion/manage/devices")}
          className="focus-ring cinema-rail-link inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mega-text-muted)] hover:text-[var(--brand-gold)]"
        >
          <MegaTvIcon name="cast" size={15} />
          Sur TV
        </Link>
      </div>
    </div>
  );
}
