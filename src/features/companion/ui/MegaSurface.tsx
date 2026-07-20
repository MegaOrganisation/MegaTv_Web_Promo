"use client";

import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  as?: "div" | "section" | "article";
};

const motionTags = { div: motion.div, section: motion.section, article: motion.article };

export function MegaSurface({
  children,
  className,
  elevated = false,
  interactive = false,
  as = "div",
  ...props
}: SurfaceProps) {
  const Tag = motionTags[as];
  const base = elevated ? "mega-surface mega-surface-elevated" : "mega-surface";

  if (interactive) {
    return (
      <Tag
        className={clsx(base, "mega-liquid-glass mega-liquid-glass-panel", elevated && "mega-liquid-glass-elevated", "mega-hover-lift mega-press cursor-pointer", className)}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        {...(props as HTMLMotionProps<"div">)}
      >
        <div className="mega-liquid-glass-shimmer pointer-events-none" aria-hidden="true" />
        <div className="mega-liquid-glass-inner relative z-[1]">{children}</div>
      </Tag>
    );
  }

  return (
    <Tag className={clsx(base, "mega-liquid-glass mega-liquid-glass-panel", elevated && "mega-liquid-glass-elevated", className)} {...(props as HTMLMotionProps<"div">)}>
      <div className="mega-liquid-glass-shimmer pointer-events-none" aria-hidden="true" />
      <div className="mega-liquid-glass-inner relative z-[1]">{children}</div>
    </Tag>
  );
}
