"use client";

import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "motion/react";

import { cinemaSpring } from "@/features/companion/motion/cinemaMotion";

/** KPI — non cliquable, pas de zoom focus sur l’encart. */
export function PremiumKpiMetric({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  index = 0
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "blue" | "teal" | "gold" | "pink";
  index?: number;
  tilt?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...cinemaSpring, delay: index * 0.06 }}
      className="h-full"
    >
      <article className={clsx("premium-kpi-card mega-spectrum-card", `premium-kpi-card--${tone}`)}>
        <div className="premium-kpi-card__inner">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="premium-kpi-label">{label}</p>
              <p className="premium-kpi-value">{value}</p>
              {hint ? <p className="premium-kpi-hint">{hint}</p> : null}
            </div>
            <div className="premium-kpi-icon">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
