"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

import { MegaTvIcon } from "@/components/icons/MegaTvIcon";
import {
  COMPANION_ADMIN_ROUTE,
  COMPANION_DOCK_ROUTES,
  isCompanionRouteActive
} from "@/features/companion/navigation/companionNavConfig";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { GlobalProfileSelector } from "@/features/companion/GlobalProfileSelector";
import { NotificationsPanel } from "@/features/companion/ui/CompanionOverlayPanels";
import { CompanionSearchModal } from "@/features/companion/ui/CompanionSearchModal";
import { CompanionSyncPulse } from "@/features/companion/ui/CompanionSyncPulse";

type Panel = "notifications" | "search" | null;

/**
 * Topbar = nav Aurora du site promo (CSS glass full-bleed).
 * Plus de WebGL / MegaLiquidGlass.
 */
export function CompanionTopBar({ isAdmin = false, headerEnd }: { isAdmin?: boolean; headerEnd?: ReactNode }) {
  const pathname = usePathname();
  const { withProfile, activeProfile } = useCompanionProfile();
  const [panel, setPanel] = useState<Panel>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isKids = Boolean(activeProfile?.is_kids_profile);
  const baseLinks = isKids
    ? COMPANION_DOCK_ROUTES.filter((r) => !["/companion/manage", "/companion/settings"].includes(r.href))
    : COMPANION_DOCK_ROUTES;
  const links = isAdmin && !isKids ? [...baseLinks, COMPANION_ADMIN_ROUTE] : baseLinks;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      const root = document.querySelector(".companion-lg-app");
      const y = root instanceof HTMLElement ? root.scrollTop : window.scrollY;
      setScrolled(y > 12);
    };
    onScroll();
    const root = document.querySelector(".companion-lg-app");
    root?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const bar = (
    <div className="companion-topbar-wrap companion-promo-nav-wrap">
      <header className={clsx("companion-promo-nav", scrolled && "is-scrolled")}>
        <Link href={withProfile("/companion")} className="companion-promo-nav__brand" aria-label="MegaCompagnon">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="MegaTv" />
        </Link>

        <div className="companion-promo-nav__right">
          <nav aria-label="Navigation principale" className="companion-promo-nav__links">
            {links.map((item) => {
              const active = isCompanionRouteActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={withProfile(item.href)}
                  prefetch
                  className={clsx("companion-promo-nav__link", active && "is-active")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="companion-promo-nav__search focus-ring"
            aria-label="Rechercher"
            onClick={() => setPanel("search")}
          >
            <MegaTvIcon name="search" size={15} />
            Rechercher…
          </button>

          <CompanionSyncPulse />

          <Link
            href={withProfile("/companion/devices")}
            className="companion-promo-nav__cta mega-spectrum-btn focus-ring"
          >
            <MegaTvIcon name="cast" size={15} />
            Pairer TV
          </Link>

          <button
            type="button"
            className={clsx("companion-promo-nav__icon focus-ring", panel === "notifications" && "is-active")}
            aria-label="Notifications"
            onClick={() => setPanel(panel === "notifications" ? null : "notifications")}
          >
            <MegaTvIcon name="bell" size={17} />
          </button>

          {headerEnd ? <div className="companion-promo-nav__slot">{headerEnd}</div> : null}
          <GlobalProfileSelector />
        </div>
      </header>
    </div>
  );

  return (
    <>
      {mounted ? createPortal(bar, document.body) : <div className="companion-topbar-wrap companion-promo-nav-wrap" aria-hidden />}
      <NotificationsPanel open={panel === "notifications"} onClose={() => setPanel(null)} />
      <CompanionSearchModal open={panel === "search"} onClose={() => setPanel(null)} />
    </>
  );
}
