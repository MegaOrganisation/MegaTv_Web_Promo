"use client";

import type { ReactNode } from "react";

import { MegaCompagnonBrand } from "@/components/ui/MegaTvMark";
import { CinemaPageSubNav } from "@/features/companion/ui/CinemaPageSubNav";
import { CinemaUtilityBar } from "@/features/companion/ui/CinemaUtilityBar";

/** Chrome sticky du cadre — profil + notifs ici (plus de flottant hors cadre). */
export function CinemaMainWindowHeader({
  headerEnd,
  isAdmin = false
}: {
  isAdmin?: boolean;
  headerEnd?: ReactNode;
}) {
  return (
    <header className="v10-main-header">
      <div className="v10-main-header__top-row">
        <MegaCompagnonBrand size={32} className="min-w-0" />
        <CinemaUtilityBar headerEnd={headerEnd} isAdmin={isAdmin} />
      </div>
      <div className="v10-main-header__subnav-row">
        <CinemaPageSubNav />
      </div>
    </header>
  );
}
