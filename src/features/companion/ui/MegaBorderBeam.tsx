"use client";

import { clsx } from "clsx";
import { motion, type Transition } from "motion/react";
import type { CSSProperties } from "react";

type Props = {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  /** MegaTv gold → magenta → blue cycle via from/to */
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
  reverse?: boolean;
  initialOffset?: number;
  transition?: Transition;
};

/**
 * Border beam MegaTv (inspired Magic UI Border Beam — libre).
 * Or `#F2B43C` → magenta `#D8497F` (ou blue) le long du rebord.
 */
export function MegaBorderBeam({
  className,
  size = 56,
  duration = 7,
  delay = 0,
  colorFrom = "#F2B43C",
  colorTo = "#D8497F",
  borderWidth = 1.5,
  reverse = false,
  initialOffset = 0,
  transition
}: Props) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] border-transparent"
      style={
        {
          borderWidth,
          borderStyle: "solid",
          maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
          maskClip: "padding-box, border-box",
          WebkitMaskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
          WebkitMaskClip: "padding-box, border-box",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor"
        } as CSSProperties
      }
      aria-hidden
    >
      <motion.div
        className={clsx("absolute aspect-square rounded-full", className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            background: `linear-gradient(90deg, ${colorFrom}, ${colorTo}, transparent)`
          } as CSSProperties
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`]
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition
        }}
      />
    </div>
  );
}
