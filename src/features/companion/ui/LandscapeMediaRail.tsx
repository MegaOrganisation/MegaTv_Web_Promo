"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { Film, Play, Tv } from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";

import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import { ScrollableRail } from "@/features/companion/ui/ScrollableRail";
import { usePosterAmbient } from "@/features/companion/ui/PosterAmbientContext";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { extractPosterColor, rgbToCss } from "@/features/companion/ui/extractPosterColor";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";

export type LandscapeCardItem = {
  id: string;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  mediaType?: "movie" | "tv";
  meta?: string | null;
  progressPercent?: number | null;
  href?: string;
  tmdbId?: number | null;
};

type Props = LandscapeCardItem & {
  index?: number;
  overlayTitle?: boolean;
  onClick?: () => void;
};

/** Carte paysage — clic + zoom uniquement sur le poster (pas l’encart). */
export function CompanionLandscapeCard({
  title,
  posterPath,
  backdropPath,
  mediaType = "movie",
  meta,
  progressPercent,
  index = 0,
  overlayTitle = true,
  onClick,
  href,
  tmdbId,
  id
}: Props) {
  const { setFromPoster, clearAmbient } = usePosterAmbient();
  const media = useMediaDetailOptional();
  const [tintRgb, setTintRgb] = useState("63, 154, 230");
  const posterUrl = tmdbProxiedImageUrl(posterPath, "w342");
  const backdropUrl = tmdbProxiedImageUrl(backdropPath, "w780");
  const image = backdropUrl || posterUrl;
  const layoutId = tmdbId ? `media-${mediaType}-${tmdbId}` : id ? `media-card-${id}` : undefined;

  async function handleEnter() {
    await setFromPoster(posterUrl, backdropUrl);
    setTintRgb(rgbToCss(await extractPosterColor(posterUrl ?? image)));
  }

  function handleOpen() {
    onClick?.();
    if (!tmdbId) return;
    media?.openMediaDetail({
      mediaType,
      tmdbId,
      title,
      posterUrl,
      backdropUrl,
      meta,
      layoutId
    });
  }

  const mediaInner = (
    <>
      {image ? (
        <CompanionCanvasImg src={image} alt="" className="mega-landscape-card-img" loading="lazy" decoding="async" />
      ) : (
        <div className="flex h-full min-h-[8rem] items-center justify-center bg-black/40 text-white/35">
          {mediaType === "tv" ? <Tv className="h-8 w-8" /> : <Film className="h-8 w-8" />}
        </div>
      )}
      <div className="mega-landscape-card-scrim" aria-hidden />
      {overlayTitle ? (
        <div className="mega-landscape-card-overlay-body pointer-events-none">
          <p className="m-0 text-sm font-extrabold leading-tight text-white line-clamp-2">{title}</p>
          {meta ? <p className="mt-1 m-0 text-[11px] font-semibold text-white/65 truncate">{meta}</p> : null}
        </div>
      ) : null}
      <span className="mega-landscape-card-play" aria-hidden>
        <Play className="h-4 w-4 fill-white text-white" />
      </span>
      {progressPercent != null && progressPercent > 0 ? (
        <div className="mega-landscape-card-progress" aria-hidden>
          <div
            className="mega-landscape-card-progress-fill"
            style={{ width: `${Math.min(99, progressPercent)}%` }}
          />
        </div>
      ) : null}
    </>
  );

  const hitClass = clsx("mega-landscape-card-hit focus-ring group");
  const cardStyle = { "--poster-tint-rgb": tintRgb } as CSSProperties;

  const hit = href ? (
    <Link
      href={href}
      className={hitClass}
      onClick={onClick}
      onMouseEnter={() => void handleEnter()}
      onMouseLeave={clearAmbient}
      onFocus={() => void handleEnter()}
      onBlur={clearAmbient}
      aria-label={title}
    >
      {mediaInner}
    </Link>
  ) : (
    <button
      type="button"
      className={hitClass}
      onClick={handleOpen}
      onMouseEnter={() => void handleEnter()}
      onMouseLeave={clearAmbient}
      onFocus={() => void handleEnter()}
      onBlur={clearAmbient}
      onTouchStart={() => void handleEnter()}
      aria-label={title}
    >
      {mediaInner}
    </button>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...cinemaSpringSnappy, delay: index * 0.05 }}
      style={cardStyle}
      className="mega-landscape-card"
      layoutId={layoutId}
    >
      <div className="mega-landscape-card-media">{hit}</div>
      {!overlayTitle ? (
        <div className="mega-landscape-card-body">
          <p className="m-0 text-sm font-bold text-white line-clamp-2">{title}</p>
          {meta ? <p className="mt-1 m-0 text-xs text-white/55 truncate">{meta}</p> : null}
        </div>
      ) : null}
    </motion.article>
  );
}

type RailProps = {
  title: string;
  subtitle?: string;
  items: LandscapeCardItem[];
  endSlot?: ReactNode;
};

export function LandscapeMediaRail({ title, subtitle, items, endSlot }: RailProps) {
  if (items.length === 0) return null;

  return (
    <section className="mega-landscape-rail-section mega-landscape-rail-section--full">
      <div className="mega-landscape-rail-header mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <h2 className="mega-section-title">{title}</h2>
          {subtitle ? <p className="mega-section-sub">{subtitle}</p> : null}
        </div>
        {endSlot}
      </div>
      <ScrollableRail className="mega-landscape-rail-track">
        {items.map((item, index) => (
          <CompanionLandscapeCard key={item.id} {...item} index={index} tmdbId={item.tmdbId ?? undefined} />
        ))}
      </ScrollableRail>
    </section>
  );
}
