"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import { MobileCompanionChrome, MobileCompanionNav } from "@/components/ui/ResponsiveShellNav";
import { companionRailVariantFromPath } from "@/features/companion/navigation/companionNavConfig";
import { CompanionTopBar } from "@/features/companion/ui/CompanionTopBar";
import { CinemaPageSubNav } from "@/features/companion/ui/CinemaPageSubNav";
import { CinemaContextRail } from "@/features/companion/ui/CinemaRightRail";
import { CompanionPageTransition } from "@/features/companion/ui/CompanionPageTransition";
import { GlobalProfileSelector } from "@/features/companion/GlobalProfileSelector";
import type { ContinueWatchingRow } from "@/lib/supabase/types";

/**
 * Shell Companion — chrome Aurora (= site promo) :
 * - Nav full-bleed CSS glass
 * - Fond aurora + grille
 * - Contenu max 1240px, cartes promo-lg
 */
export function ResponsiveShell({
  children,
  title,
  subtitle,
  isAdmin = false,
  headerEnd,
  hero,
  showRail = true,
  continueWatching,
  hidePageHeader = false
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
  headerEnd?: ReactNode;
  hero?: ReactNode;
  showRail?: boolean;
  continueWatching?: ContinueWatchingRow[];
  hidePageHeader?: boolean;
}) {
  const pathname = usePathname();
  const railVariant = companionRailVariantFromPath(pathname);
  const [mounted, setMounted] = useState(false);
  const showContextRail = showRail && railVariant !== "none";
  const splitCw = showContextRail && railVariant === "dashboard";

  useEffect(() => setMounted(true), []);

  const mobileNav = mounted ? createPortal(<MobileCompanionNav isAdmin={isAdmin} />, document.body) : null;
  const mobileChrome = mounted
    ? createPortal(
        <MobileCompanionChrome isAdmin={isAdmin} headerEnd={headerEnd} profileAnchor={<GlobalProfileSelector />} />,
        document.body
      )
    : null;

  const rail = showContextRail ? (
    <aside className={clsx("companion-inline-rail", splitCw && "companion-inline-rail--cw")}>
      <CinemaContextRail variant={railVariant} items={continueWatching} embedded />
    </aside>
  ) : null;

  return (
    <div className="companion-shell companion-shell--pj1 companion-shell--v10 companion-shell--unified companion-shell--filesnap companion-shell--promo companion-shell--page-scroll">
      <CompanionTopBar isAdmin={isAdmin} headerEnd={headerEnd} />
      {mobileChrome}
      {mobileNav}

      <div className="companion-main-frame-wrap">
        <section className="companion-main-frame companion-main-frame--css-glass">
          <div className="companion-main-frame__chrome">
            <CinemaPageSubNav />
          </div>

          <div className="companion-main-frame__body">
            {hero ? <div className="companion-main-frame__hero">{hero}</div> : null}

            <div className={clsx(splitCw ? "companion-main-frame__body--split" : "companion-main-frame__body--stack")}>
              <div className="companion-main-frame__primary">
                {!hidePageHeader ? (
                  <header className="mega-cinema-page-header mb-3 sm:mb-4">
                    <h1>{title}</h1>
                    {subtitle ? <p>{subtitle}</p> : null}
                  </header>
                ) : null}
                <CompanionPageTransition>{children}</CompanionPageTransition>
              </div>
              {rail}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
