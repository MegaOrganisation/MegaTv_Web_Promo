"use client";

import { motion } from "motion/react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import { fadeUp } from "@/features/companion/motion/cinemaMotion";

/** Tuile bento — non interactive (pas de zoom / clic sur l’encart). */
export function CinemaGlassTile({
  children,
  className,
  index = 0,
  id
}: {
  children: ReactNode;
  className?: string;
  index?: number;
  id?: string;
  beam?: boolean;
}) {
  return (
    <motion.section
      id={id}
      {...fadeUp(index)}
      className={clsx("mega-cinema-float-tile mega-cinema-float-tile--static scroll-mt-28", className)}
    >
      <div className="mega-cinema-float-tile__noise pointer-events-none" aria-hidden="true" />
      <div className="relative z-[1]">{children}</div>
    </motion.section>
  );
}
