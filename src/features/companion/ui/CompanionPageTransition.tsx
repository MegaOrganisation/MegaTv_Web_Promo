"use client";

import type { ReactNode } from "react";

/**
 * Contenu page — pas d'AnimatePresence (évite flash / remount au changement de route).
 * Le shell (chrome + dock + frames) reste monté.
 */
export function CompanionPageTransition({ children }: { children: ReactNode }) {
  return <div className="companion-page-layer min-w-0">{children}</div>;
}
