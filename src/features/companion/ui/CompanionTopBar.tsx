"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
 * Topbar = .nav du site promo.
 * Sticky DANS .companion-lg-app (pas de portal body) pour que backdrop-filter
 * floute vraiment le contenu qui défile — comme la landing.
 */
export function CompanionTopBar({ isAdmin = false, headerEnd }: { isAdmin?: boolean; headerEnd?: ReactNode }) {
  const pathname = usePathname();
  const { withProfile } = useCompanionProfile();
  const [panel, setPanel] = useState<Panel>(null);
  const [scrolled, setScrolled] = useState(false);
  const links = isAdmin ? [...COMPANION_DOCK_ROUTES, COMPANION_ADMIN_ROUTE] : COMPANION_DOCK_ROUTES;

  useEffect(() => {
    const root = document.querySelector(".companion-lg-app");
    const onScroll = () => {
      const y = root instanceof HTMLElement ? root.scrollTop : window.scrollY;
      setScrolled(y > 12);
    };
    onScroll();
    root?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
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

            <a
              href="https://megatv-auth-site.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="companion-promo-nav__cta mega-spectrum-btn focus-ring"
            >
              <MegaTvIcon name="cast" size={15} />
              Pairer TV
            </a>

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

      <NotificationsPanel open={panel === "notifications"} onClose={() => setPanel(null)} />
      <CompanionSearchModal open={panel === "search"} onClose={() => setPanel(null)} />
    </>
  );
}
