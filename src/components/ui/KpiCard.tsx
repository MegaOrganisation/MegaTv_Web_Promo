"use client";

import type { LucideIcon } from "lucide-react";

import { PremiumKpiMetric } from "@/features/companion/ui/PremiumKpiMetric";

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "blue",
  index = 0
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "gold" | "pink";
  compact?: boolean;
  index?: number;
}) {
  const toneMap = { blue: "blue", green: "teal", gold: "gold", pink: "pink" } as const;
  return (
    <PremiumKpiMetric
      label={label}
      value={value}
      hint={hint}
      icon={icon}
      tone={toneMap[tone]}
      index={index}
      tilt={index === 0}
    />
  );
}
