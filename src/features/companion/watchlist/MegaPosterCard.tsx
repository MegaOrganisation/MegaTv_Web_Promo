"use client";

import { clsx } from "clsx";
import { motion } from "motion/react";
import { Film, Play, Tv } from "lucide-react";
import { useState, type CSSProperties } from "react";

import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";
import { usePosterAmbient } from "@/features/companion/ui/PosterAmbientContext";
import { extractPosterColor, rgbToCss } from "@/features/companion/ui/extractPosterColor";

export type PosterCardVariant = "hero" | "landscape" | "portrait";

type Props = {
  title: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  mediaType: "movie" | "tv";
  variant?: PosterCardVariant;
  meta?: string;
  onClick: () => void;
  index?: number;
};

/** Carte cinéma — titre sur bandeau blur (MovieHub / pj1), jamais de bloc gris séparé. */
export function MegaPosterCard({
  title,
  posterUrl,
  backdropUrl,
  mediaType,
  variant = "portrait",
  meta,
  onClick,
  index = 0
}: Props) {
  const { setFromPoster, clearAmbient } = usePosterAmbient();
  const [tintRgb, setTintRgb] = useState("216, 73, 127");
  const isHero = variant === "hero";
  const isLandscape = variant === "landscape" || isHero;
  const image = isLandscape && backdropUrl ? backdropUrl : posterUrl;

  async function handleEnter() {
    await setFromPoster(posterUrl ?? null, backdropUrl ?? null);
    setTintRgb(rgbToCss(await extractPosterColor(posterUrl ?? image ?? null)));
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => void handleEnter()}
      onMouseLeave={clearAmbient}
      onFocus={() => void handleEnter()}
      onBlur={clearAmbient}
      onTouchStart={() => void handleEnter()}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      className={clsx(
        "mega-cinema-poster focus-ring group overflow-hidden text-left",
        isHero && "mega-cinema-poster--hero",
        variant === "landscape" && "mega-cinema-poster--landscape",
        variant === "portrait" && "mega-cinema-poster--portrait"
      )}
      style={{ "--poster-glow-rgb": tintRgb } as CSSProperties}
    >
      <div className="mega-cinema-poster__frame">
        {image ? (
          <>
            <CompanionCanvasImg src={image} alt="" className="mega-cinema-poster__img" loading="lazy" decoding="async" />
            <div className="mega-cinema-poster__blur-cap" aria-hidden="true">
              <CompanionCanvasImg src={image} alt="" className="mega-cinema-poster__blur-img" loading="lazy" decoding="async" />
              <div className="mega-cinema-poster__blur-scrim" />
            </div>
          </>
        ) : (
          <div className="grid h-full w-full place-items-center bg-[#12161a] text-white/30">
            {mediaType === "tv" ? <Tv className="h-10 w-10" /> : <Film className="h-10 w-10" />}
          </div>
        )}
        <div className="mega-cinema-poster__rim" aria-hidden="true" />
        <div className="mega-cinema-poster__play" aria-hidden="true">
          <Play className="h-4 w-4 fill-white text-white" />
        </div>
        <div className="mega-cinema-poster__caption">
          {meta ? <span className="mega-cinema-poster__chip">{meta.split(" · ")[0] || meta}</span> : null}
          <p className="mega-cinema-poster__title">{title}</p>
          {meta && meta.includes(" · ") ? <p className="mega-cinema-poster__meta">{meta.split(" · ").slice(1).join(" · ")}</p> : null}
        </div>
      </div>
    </motion.button>
  );
}

/** Grille éditoriale fixe — pas de hasard portrait/paysage. */
export function layoutVariantForIndex(index: number): PosterCardVariant {
  if (index === 0) return "hero";
  if (index >= 1 && index <= 4) return "portrait";
  return "landscape";
}

export function layoutCellClass(index: number): string {
  if (index === 0) return "mega-cinema-grid__hero";
  if (index >= 1 && index <= 4) return "mega-cinema-grid__portrait";
  return "mega-cinema-grid__landscape";
}
