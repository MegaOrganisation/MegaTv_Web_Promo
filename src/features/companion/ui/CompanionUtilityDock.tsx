"use client";



import Link from "next/link";

import { useState } from "react";

import { clsx } from "clsx";

import { motion } from "motion/react";



import { MegaTvIsoIcon } from "@/components/ui/MegaTvIsoIcon";

import { MegaTvMark } from "@/components/ui/MegaTvMark";

import { MegaLiquidGlass } from "@/components/ui/MegaLiquidGlass";

import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";

import {

  CalendarPanel,

  ExposeViewPanel,

  NotificationsPanel,

  QuickAccessPanel

} from "@/features/companion/ui/CompanionOverlayPanels";



type Panel = "expose" | "notifications" | "calendar" | "quick" | null;



export function CompanionUtilityDock({ isAdmin = false }: { isAdmin?: boolean }) {

  const [panel, setPanel] = useState<Panel>(null);



  const buttons: Array<{ id: Panel; label: string; icon: "grid" | "bell" | "calendar" | "bolt" }> = [

    { id: "expose", label: "Vue éclatée", icon: "grid" },

    { id: "notifications", label: "Notifications", icon: "bell" },

    { id: "calendar", label: "Calendrier", icon: "calendar" },

    { id: "quick", label: "Accès rapide", icon: "bolt" }

  ];



  return (

    <>

      <div className="companion-utility-dock-wrap">

        <motion.div whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.94 }} transition={cinemaSpringSnappy}>

          <Link href="/" className="companion-utility-dock-logo focus-ring" title="MegaTv">

            <MegaTvMark size={36} />

          </Link>

        </motion.div>

        <MegaLiquidGlass className="companion-utility-dock-glass">

          <nav aria-label="Outils MegaCompagnon" className="companion-utility-dock">

            {buttons.map((btn) => (

              <motion.button

                key={btn.id}

                type="button"

                title={btn.label}

                aria-label={btn.label}

                whileHover={{ scale: 1.1, y: -2 }}

                whileTap={{ scale: 0.92 }}

                transition={cinemaSpringSnappy}

                className={clsx("companion-utility-dock-btn focus-ring", panel === btn.id && "is-active")}

                onClick={() => setPanel(btn.id)}

              >

                <MegaTvIsoIcon name={btn.icon} className="h-[1.2rem] w-[1.2rem]" />

              </motion.button>

            ))}

          </nav>

        </MegaLiquidGlass>

      </div>



      <ExposeViewPanel open={panel === "expose"} onClose={() => setPanel(null)} isAdmin={isAdmin} />

      <NotificationsPanel open={panel === "notifications"} onClose={() => setPanel(null)} />

      <CalendarPanel open={panel === "calendar"} onClose={() => setPanel(null)} />

      <QuickAccessPanel open={panel === "quick"} onClose={() => setPanel(null)} isAdmin={isAdmin} />

    </>

  );

}

