"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { megaHeroCrossfade } from "@/features/web/motion/mega-motion";
import { tmdbBackdropPictureFromUrl } from "@/lib/tmdb";

/** Shared hero/detail backdrop shell — Motion crossfade + TMDB cover treatment. */
export function MediaHeroBackdrop({
  src,
  alt,
  children,
  chromeHidden = false,
  motionKey,
  className
}: {
  src: string | null;
  alt: string;
  children?: ReactNode;
  chromeHidden?: boolean;
  /** When set, backdrop crossfades on key change (hero carousel). */
  motionKey?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const picture = tmdbBackdropPictureFromUrl(src);

  return (
    <div className={clsx("mega-hero-shell relative w-full overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        {picture ? (
          reduceMotion ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={motionKey || picture.src}
              src={picture.src}
              srcSet={picture.srcSet}
              sizes={picture.sizes}
              alt={alt}
              className="h-full w-full object-cover"
            />
          ) : (
            <motion.img
              key={motionKey || picture.src}
              src={picture.src}
              srcSet={picture.srcSet}
              sizes={picture.sizes}
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover"
              variants={megaHeroCrossfade}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          )
        ) : (
          <div key="empty" className="h-full w-full bg-[var(--mega-surface)]" />
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: chromeHidden ? 0 : 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,10,0.92)_0%,rgba(6,7,10,0.55)_45%,rgba(6,7,10,0.1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,10,0.9)_0%,transparent_55%)]" />
      </motion.div>
      {children}
    </div>
  );
}
