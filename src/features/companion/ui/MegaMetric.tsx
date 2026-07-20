"use client";

import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "motion/react";

import { MegaSurface } from "@/features/companion/ui/MegaSurface";

const tones = {
  blue: "mega-metric mega-metric-blue",
  teal: "mega-metric mega-metric-teal",
  gold: "mega-metric mega-metric-gold",
  pink: "mega-metric mega-metric-pink"
} as const;

type Tone = keyof typeof tones;

/** Mini bar chart heights 0–100 for spark effect */
function MiniBars({ values, highlightIndex }: { values: number[]; highlightIndex?: number }) {
  return (
    <div className="mega-metric-bars" aria-hidden="true">
      {values.map((h, i) => (
        <motion.span
          key={i}
          className={clsx("mega-chart-bar", i === highlightIndex && "mega-chart-bar-active")}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: `${Math.max(12, h)}%` }}
        />
      ))}
    </div>
  );
}

export function MegaMetric({
  label,
  value,
  hint,
  delta,
  deltaTone = "up",
  icon: Icon,
  tone = "blue",
  bars = [22, 38, 30, 72, 44],
  highlightBar = 3,
  compact = false,
  index = 0
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon: LucideIcon;
  tone?: Tone;
  bars?: number[];
  highlightBar?: number;
  compact?: boolean;
  index?: number;
}) {
  const deltaClass =
    deltaTone === "up" ? "mega-metric-delta mega-metric-delta-up" : deltaTone === "down" ? "mega-metric-delta mega-metric-delta-down" : "mega-metric-delta";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <MegaSurface className={clsx(tones[tone], compact && "p-4")} elevated>
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mega-metric-label">{label}</p>
            <p className={clsx("mega-metric-value", compact && "text-2xl")}>{value}</p>
            {delta ? <span className={deltaClass}>{delta}</span> : null}
            {hint ? <p className="mt-2 text-xs text-[var(--mega-text-faint)]">{hint}</p> : null}
          </div>
          <div className="mega-metric-icon-wrap">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        </div>
        <MiniBars values={bars} highlightIndex={highlightBar} />
      </MegaSurface>
    </motion.div>
  );
}
