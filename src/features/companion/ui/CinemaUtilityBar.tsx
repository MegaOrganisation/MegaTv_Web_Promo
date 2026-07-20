"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { clsx } from "clsx";

import { MegaTvIcon } from "@/components/icons/MegaTvIcon";
import { MegaLiquidGlass } from "@/components/ui/MegaLiquidGlass";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { GlobalProfileSelector } from "@/features/companion/GlobalProfileSelector";
import { NotificationsPanel } from "@/features/companion/ui/CompanionOverlayPanels";
import { CompanionSearchModal } from "@/features/companion/ui/CompanionSearchModal";
import { MEGA_LG_BUTTON_CONFIG } from "@/features/companion/liquid-glass/ybouaneGlassConfig";
import { useMegaLiquidGlassOptional } from "@/features/companion/liquid-glass/MegaLiquidGlassProvider";

type Panel = "notifications" | "search" | null;

function UtilityGlassPill({
  href,
  children,
  className
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const glass = useMegaLiquidGlassOptional();
  const inner = (
    <Link href={href} className={clsx("v10-utility-pill focus-ring", glass && "v10-utility-pill--in-glass", className)}>
      {children}
    </Link>
  );
  if (!glass) return inner;
  return (
    <MegaLiquidGlass className="v10-utility-pill-lg" configOverrides={{ ...MEGA_LG_BUTTON_CONFIG, cornerRadius: 999, zRadius: 18 }}>
      {inner}
    </MegaLiquidGlass>
  );
}

/** Utilitaires sticky — search + notifs + profil (mobile + desktop). */
export function CinemaUtilityBar({
  headerEnd,
  isAdmin = false
}: {
  headerEnd?: ReactNode;
  isAdmin?: boolean;
}) {
  const { withProfile } = useCompanionProfile();
  const glass = useMegaLiquidGlassOptional();
  const [panel, setPanel] = useState<Panel>(null);

  const searchBtn = (
    <button
      type="button"
      className={clsx("v10-utility-search v10-utility-search--loud focus-ring", glass && "v10-utility-search--in-glass")}
      aria-label="Rechercher dans MegaCompagnon"
      onClick={() => setPanel("search")}
    >
      <MegaTvIcon name="search" size={18} className="text-[var(--mega-text)]" />
      <span className="hidden sm:inline">Rechercher…</span>
    </button>
  );

  return (
    <>
      <div className="v10-utility-bar v10-utility-bar--inline v10-utility-bar--chrome">
        <div className="v10-utility-bar__inner">
          {glass ? (
            <MegaLiquidGlass
              className="v10-utility-search-lg"
              configOverrides={{ ...MEGA_LG_BUTTON_CONFIG, cornerRadius: 999, zRadius: 20, button: true }}
            >
              {searchBtn}
            </MegaLiquidGlass>
          ) : (
            searchBtn
          )}

          <div className="v10-utility-actions">
            <div className="hidden md:contents">
              <UtilityGlassPill href={withProfile("/companion/devices")}>
                <MegaTvIcon name="cast" size={16} />
                Pairer TV
              </UtilityGlassPill>
            </div>

            {isAdmin ? (
              <div className="hidden sm:contents">
                <UtilityGlassPill href={withProfile("/companion/admin")}>
                  <MegaTvIcon name="shield" size={16} />
                  Admin
                </UtilityGlassPill>
              </div>
            ) : null}

            <motion.button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className={clsx("v10-utility-icon-btn focus-ring", panel === "notifications" && "is-active")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={cinemaSpringSnappy}
              onClick={() => setPanel(panel === "notifications" ? null : "notifications")}
            >
              <MegaTvIcon name="bell" size={18} />
            </motion.button>

            {headerEnd ? <div className="v10-utility-slot">{headerEnd}</div> : null}
            <GlobalProfileSelector />
          </div>
        </div>
      </div>

      <NotificationsPanel open={panel === "notifications"} onClose={() => setPanel(null)} />
      <CompanionSearchModal open={panel === "search"} onClose={() => setPanel(null)} />
    </>
  );
}
