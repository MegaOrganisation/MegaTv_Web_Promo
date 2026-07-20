"use client";

import Link from "next/link";
import { Bell, Search, Settings } from "lucide-react";
import { motion } from "motion/react";

import { GlobalProfileSelector } from "@/features/companion/GlobalProfileSelector";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

/** Barre utilitaire PJ1 — rail droit (search, notif, réglages, profil). */
export function CinemaRailHeader() {
  const { withProfile } = useCompanionProfile();

  return (
    <div className="pj1-rail-header mb-4 flex items-center justify-end gap-2 border-b border-white/8 pb-3">
      <motion.button
        type="button"
        aria-label="Rechercher"
        className="pj1-rail-icon-btn focus-ring"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={cinemaSpringSnappy}
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
      </motion.button>
      <motion.button
        type="button"
        aria-label="Notifications"
        className="pj1-rail-icon-btn focus-ring"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={cinemaSpringSnappy}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
      </motion.button>
      <Link href={withProfile("/companion/settings")} className="pj1-rail-icon-btn focus-ring" aria-label="Réglages">
        <Settings className="h-4 w-4" strokeWidth={1.75} />
      </Link>
      <GlobalProfileSelector />
    </div>
  );
}
