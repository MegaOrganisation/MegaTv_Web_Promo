"use client";

import { useCompanionBackgroundOptional } from "@/features/companion/CompanionBackgroundContext";

/**
 * Fond ambient léger — 1 couche CSS (pas SVG, pas data-dynamic).
 * Évite le re-capture WebGL frame-par-frame qui freinait le site.
 */
export function CompanionAmbientMotion() {
  const bg = useCompanionBackgroundOptional()?.background ?? "ember";
  if (bg === "midnight") return null;

  return (
    <div className="companion-ambient-motion companion-ambient-motion--lite" aria-hidden="true">
      <div className="companion-ambient-motion__sheen" />
    </div>
  );
}
