"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "motion/react";

import { MegaLiquidGlass } from "@/components/ui/MegaLiquidGlass";
import {
  COMPANION_ADMIN_ROUTE,
  COMPANION_DOCK_ROUTES,
  isCompanionRouteActive
} from "@/features/companion/navigation/companionNavConfig";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { DockLottieIcon } from "@/features/companion/ui/DockLottieIcon";
import { MEGA_LG_DOCK_CONFIG } from "@/features/companion/liquid-glass/ybouaneGlassConfig";

/** Dock desktop — barre horizontale haut-centre, liquid glass ybouane. */
export function CinemaNavDock({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { withProfile } = useCompanionProfile();
  const links = isAdmin ? [...COMPANION_DOCK_ROUTES, COMPANION_ADMIN_ROUTE] : COMPANION_DOCK_ROUTES;

  return (
    <div className="pj1-nav-dock-wrap">
      <MegaLiquidGlass
        className="pj1-nav-dock-glass"
        configOverrides={{
          ...MEGA_LG_DOCK_CONFIG,
          cornerRadius: 999,
          zRadius: 28,
          button: false
        }}
      >
        <nav aria-label="Navigation principale" className="pj1-nav-dock">
          {links.map((item) => {
            const active = isCompanionRouteActive(pathname, item.href, item.exact);
            return (
              <motion.div key={item.href} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} transition={cinemaSpringSnappy}>
                <Link
                  href={withProfile(item.href)}
                  prefetch
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={clsx("pj1-nav-dock-btn focus-ring relative", active && "is-active")}
                >
                  {active ? (
                    <motion.span
                      layoutId="companion-desktop-dock-active"
                      className="pj1-nav-dock-btn__bubble"
                      transition={cinemaSpringSnappy}
                    />
                  ) : null}
                  <DockLottieIcon name={item.icon} active={active} size={18} />
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </MegaLiquidGlass>
    </div>
  );
}
