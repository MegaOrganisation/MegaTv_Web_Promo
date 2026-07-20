"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import { clsx } from "clsx";
import { Suspense, useEffect, useState } from "react";

import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

type SubTab = { href: string; label: string; exact?: boolean; type?: string };

/** Hash propre — ignore `?profile=` collé après # (legacy). */
function normalizeHash(raw: string) {
  if (!raw) return "";
  return raw.split("?")[0] || "";
}

function useHash() {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => setHash(normalizeHash(window.location.hash));
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);
  return hash;
}

function SubNavPills({ tabs, ariaLabel }: { tabs: SubTab[]; ariaLabel: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { withProfile } = useCompanionProfile();
  const hash = useHash();
  const typeParam = searchParams.get("type");

  return (
    <LayoutGroup id={`subnav-${ariaLabel}`}>
      <nav aria-label={ariaLabel} className="v10-subnav companion-glass-tray">
        {tabs.map((tab) => {
          const base = tab.href.split("#")[0]?.split("?")[0] || tab.href;
          const tabHash = tab.href.includes("#") ? `#${tab.href.split("#")[1]?.split("?")[0]}` : "";
          let active = tab.exact ? pathname === base && !typeParam : pathname.startsWith(base);

          if (tab.type) {
            active = pathname.startsWith("/companion/watchlist") && typeParam === tab.type;
          } else if (tab.exact && pathname.startsWith("/companion/watchlist")) {
            active = !typeParam;
          }

          if (tab.href.includes("#") && (pathname === "/companion" || pathname.startsWith("/companion/settings"))) {
            if (tabHash === "#overview" || tabHash === "#compte") active = !hash || hash === tabHash;
            else active = hash === tabHash;
          }

          return (
            <motion.div
              key={tab.href}
              whileHover={active ? undefined : { scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={cinemaSpringSnappy}
            >
              <Link
                href={withProfile(tab.href)}
                scroll={false}
                onClick={(e) => {
                  if (!tabHash) return;
                  e.preventDefault();
                  const next = withProfile(tab.href);
                  window.history.pushState(null, "", next);
                  setTimeout(() => {
                    window.dispatchEvent(new HashChangeEvent("hashchange"));
                    const id = tabHash.slice(1);
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 0);
                }}
                className={clsx("v10-subnav-item companion-glass-btn focus-ring relative", active && "is-active")}
              >
                {active ? (
                  <motion.span layoutId="v10-subnav-bubble" className="v10-subnav-bubble" transition={cinemaSpringSnappy} />
                ) : null}
                <motion.span
                  className="relative z-[1]"
                  animate={{ scale: active ? 1.04 : 1, opacity: active ? 1 : 0.72 }}
                  transition={cinemaSpringSnappy}
                >
                  {tab.label}
                </motion.span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}

function CinemaPageSubNavInner() {
  const pathname = usePathname();

  if (pathname === "/companion") {
    return (
      <SubNavPills
        ariaLabel="Sections dashboard"
        tabs={[
          { href: "/companion#overview", label: "Vue d'ensemble", exact: true },
          { href: "/companion#activity", label: "Activité" },
          { href: "/companion#history", label: "Historique" }
        ]}
      />
    );
  }

  if (pathname.startsWith("/companion/watchlist")) {
    return (
      <SubNavPills
        ariaLabel="Filtres watchlist"
        tabs={[
          { href: "/companion/watchlist", label: "Tout", exact: true },
          { href: "/companion/watchlist?type=movie", label: "Films", type: "movie" },
          { href: "/companion/watchlist?type=tv", label: "Séries", type: "tv" }
        ]}
      />
    );
  }

  if (pathname.startsWith("/companion/settings")) {
    return (
      <SubNavPills
        ariaLabel="Sections réglages"
        tabs={[
          { href: "/companion/settings#compte", label: "Compte", exact: true },
          { href: "/companion/settings#apparence", label: "Apparence" },
          { href: "/companion/settings#sync", label: "Sync" }
        ]}
      />
    );
  }

  return null;
}

/** Filtres — tray glass + bulle spring ; hash via pushState (actif fiable). */
export function CinemaPageSubNav() {
  return (
    <Suspense fallback={<nav className="v10-subnav companion-glass-tray" aria-hidden />}>
      <CinemaPageSubNavInner />
    </Suspense>
  );
}
