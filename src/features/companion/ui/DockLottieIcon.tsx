"use client";

import { clsx } from "clsx";

import { MegaTvIcon, type MegaTvIconName } from "@/components/icons/MegaTvIcon";

type Props = {
  name: MegaTvIconName;
  active: boolean;
  size?: number;
  className?: string;
};

/** Icône dock — actif = blanc plein. Pas de morph décoratif sous l’icône. */
export function DockLottieIcon({ name, active, size = 20, className }: Props) {
  return (
    <span className={clsx("dock-icon-slot", active && "is-active", className)} aria-hidden>
      <MegaTvIcon
        name={name}
        size={size}
        filled={active}
        className={clsx("dock-icon-glyph", active && "dock-icon-glyph--active")}
      />
    </span>
  );
}
