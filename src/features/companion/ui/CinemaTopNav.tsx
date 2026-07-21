"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

const tabs = [
  { href: "/companion", label: "Dashboard", exact: true },
  { href: "/companion/watchlist", label: "Watchlist" },
  { href: "/companion/manage", label: "Gérer" },
  { href: "/companion/settings", label: "Réglages", exact: true }
] as const;

export function CinemaTopNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { withProfile } = useCompanionProfile();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const items = isAdmin ? [...tabs, { href: "/companion/admin", label: "Admin", exact: true } as const] : [...tabs];

  return (
    <nav aria-label="Sections MegaCompagnon" className="mega-cinema-topnav hidden sm:flex flex-wrap">
      {items.map((tab) => {
        const active = isActive(tab.href, "exact" in tab && tab.exact);
        return (
          <motion.div key={tab.href} whileHover={active ? undefined : { scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={cinemaSpringSnappy}>
            <Link href={withProfile(tab.href)} prefetch className="mega-cinema-topnav-item focus-ring relative px-4 py-2.5 text-sm font-bold">
              {active ? (
                <motion.span
                  layoutId="cinema-topnav-bubble"
                  className="mega-cinema-topnav-bubble mega-cinema-topnav-bubble--gold"
                  transition={cinemaSpringSnappy}
                />
              ) : null}
              <span className={active ? "relative z-[1] text-[#0c0e12]" : "relative z-[1] text-white/55"}>{tab.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
