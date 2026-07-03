"use client";

import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

import { GlassCard } from "@/components/ui/GlassCard";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  compact = false
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "gold" | "pink";
  compact?: boolean;
}) {
  const tones = {
    blue: "from-[#3f9ae6]/55 via-[#3f9ae6]/10 to-transparent text-[#9ed7ff]",
    green: "from-[#00d588]/50 via-[#00d588]/10 to-transparent text-[#9dffd9]",
    gold: "from-[#ffcd3c]/50 via-[#ffcd3c]/10 to-transparent text-[#ffe59c]",
    pink: "from-[#d8497f]/50 via-[#d8497f]/10 to-transparent text-[#ffb0d0]"
  };

  return (
    <GlassCard className={clsx("group relative overflow-hidden transition duration-300 max-lg:hover:translate-y-0 hover:-translate-y-0.5 hover:border-[var(--mega-border-strong)]", compact && "p-4 sm:p-4")}>
      <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${tones[tone]} opacity-80`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mega-text-muted)] sm:text-sm">{label}</p>
          <p className={clsx("mt-2 font-black tracking-tight text-[var(--mega-text)]", compact ? "text-2xl" : "text-3xl sm:text-4xl")}>{value}</p>
          {hint ? <p className="mt-2 text-xs leading-5 text-[var(--mega-text-faint)]">{hint}</p> : null}
        </div>
        <div className="rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition group-hover:scale-105">
          <Icon className="h-5 w-5 text-[var(--mega-text)]" />
        </div>
      </div>
    </GlassCard>
  );
}
