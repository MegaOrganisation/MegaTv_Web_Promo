"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: "gold" | "ghost" | "glass";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  "aria-label"?: string;
};

/** Bouton — CSS glass cohérent (pas de WebGL par bouton = stabilité). */
export function PremiumButton({ children, className, variant = "glass", href, onClick, type = "button", disabled, ...rest }: Props) {
  const classes = clsx(
    "premium-cinema-btn focus-ring inline-flex items-center justify-center gap-2 rounded-full font-bold",
    variant === "gold" && "premium-cinema-btn--gold",
    variant === "ghost" && "premium-cinema-btn--ghost",
    variant === "glass" && "premium-cinema-btn--glass",
    disabled && "pointer-events-none opacity-50",
    className
  );

  const motionProps = {
    whileHover: disabled ? undefined : { y: -1 },
    whileTap: disabled ? undefined : { scale: 0.98 },
    transition: cinemaSpringSnappy
  };

  if (href) {
    return (
      <motion.span {...motionProps} className="inline-flex">
        <Link href={href} className={classes} {...rest}>
          {children}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.button type={type} className={classes} onClick={onClick} disabled={disabled} {...motionProps} {...rest}>
      {children}
    </motion.button>
  );
}
