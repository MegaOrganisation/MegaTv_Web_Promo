"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { PremiumButton } from "@/components/ui/PremiumButton";
import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";
import { cinemaEase } from "@/features/companion/motion/cinemaMotion";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { encodeMediaId } from "@/lib/web/media";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";
import type { ContinueWatchingRow } from "@/lib/supabase/types";

type Slide = {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  posterUrl: string | null;
  badge: string;
  playerHref?: string;
  mediaType?: "movie" | "tv";
  tmdbId?: number;
  layoutId?: string;
};

function toSlides(items: ContinueWatchingRow[], withProfile: (href: string) => string): Slide[] {
  return items.slice(0, 5).map((item) => {
    const mediaId = item.tmdb_id ? encodeMediaId(item.media_type, item.tmdb_id, item.season, item.episode) : null;
    const mediaType = (item.media_type === "tv" ? "tv" : "movie") as "movie" | "tv";
    return {
      title: item.title || `TMDB ${item.tmdb_id}`,
      subtitle:
        item.media_type === "tv" && item.season
          ? `S${item.season} · E${item.episode ?? 1}${item.episode_title ? ` — ${item.episode_title}` : ""}`
          : item.media_type === "tv"
            ? "Série en cours"
            : "Film en cours",
      imageUrl: tmdbProxiedImageUrl(item.backdrop_path || item.poster_path, "w780"),
      posterUrl: tmdbProxiedImageUrl(item.poster_path, "w185"),
      badge: "Reprendre",
      playerHref: mediaId ? withProfile(`/web/player/${mediaId}`) : undefined,
      mediaType,
      tmdbId: item.tmdb_id || undefined,
      layoutId: item.tmdb_id ? `media-${mediaType}-${item.tmdb_id}` : undefined
    };
  });
}

export function CinemaHeroCarousel({
  items,
  fallbackTitle,
  fallbackSubtitle,
  fallbackImage
}: {
  items: ContinueWatchingRow[];
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackImage?: string | null;
}) {
  const { withProfile } = useCompanionProfile();
  const media = useMediaDetailOptional();

  const slides = useMemo(
    () =>
      items.length > 0
        ? toSlides(items, withProfile)
        : [
            {
              title: fallbackTitle,
              subtitle: fallbackSubtitle,
              imageUrl: fallbackImage ?? null,
              posterUrl: null,
              badge: "Profil actif"
            }
          ],
    [items, fallbackTitle, fallbackSubtitle, fallbackImage, withProfile]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index]!;

  function openDetail() {
    if (!slide.tmdbId || !slide.mediaType) return;
    media?.openMediaDetail({
      mediaType: slide.mediaType,
      tmdbId: slide.tmdbId,
      title: slide.title,
      posterUrl: slide.posterUrl,
      backdropUrl: slide.imageUrl,
      meta: slide.subtitle,
      layoutId: slide.layoutId
    });
  }

  return (
    <motion.section
      className="mega-cinema-hero mega-cinema-hero-carousel mb-6 sm:mb-8"
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: cinemaEase }}
    >
      <div className="mega-cinema-hero__frame">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: cinemaEase }}
          >
            {slide.imageUrl ? (
              <>
                <CompanionCanvasImg src={slide.imageUrl} alt="" className="mega-cinema-hero__img" />
                <div className="mega-cinema-poster__blur-cap mega-cinema-hero__blur" aria-hidden="true">
                  <CompanionCanvasImg src={slide.imageUrl} alt="" className="mega-cinema-poster__blur-img" />
                </div>
              </>
            ) : (
              <div className="mega-cinema-hero__fallback" aria-hidden="true" />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mega-cinema-hero__rim" aria-hidden="true" />

        <div className="mega-cinema-hero__content">
          <span className="mega-cinema-poster__chip">{slide.badge}</span>
          {slide.tmdbId ? (
            <button type="button" className="mega-cinema-hero__title-btn focus-ring text-left" onClick={openDetail}>
              {slide.posterUrl ? (
                <motion.span layoutId={slide.layoutId} className="mega-cinema-hero__title-poster">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.posterUrl} alt="" />
                </motion.span>
              ) : null}
              <h2 className="mega-cinema-hero__title">{slide.title}</h2>
            </button>
          ) : (
            <h2 className="mega-cinema-hero__title">{slide.title}</h2>
          )}
          <p className="mega-cinema-hero__sub">{slide.subtitle}</p>
          {slide.playerHref ? (
            <div className="mega-cinema-hero__actions">
              <PremiumButton href={slide.playerHref} variant="gold" className="mega-spectrum-btn px-5 py-2.5 text-sm">
                <Play className="h-4 w-4 fill-current" />
                Reprendre
              </PremiumButton>
            </div>
          ) : null}
        </div>

        {slides.length > 1 ? (
          <>
            <div className="mega-cinema-hero-dots" aria-hidden="true">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === index ? "is-active" : undefined}
                  onClick={() => setIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="mega-cinema-hero-nav">
              <motion.button
                type="button"
                className="mega-cinema-hero-nav-btn focus-ring"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
                aria-label="Précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                className="mega-cinema-hero-nav-btn focus-ring"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIndex((i) => (i + 1) % slides.length)}
                aria-label="Suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </>
        ) : null}
      </div>
    </motion.section>
  );
}
