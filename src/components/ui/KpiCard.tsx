import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "gold" | "pink";
}) {
  const tones = {
    blue: "from-[#3f9ae6]/50 to-transparent text-[#9ed7ff]",
    green: "from-[#00d588]/45 to-transparent text-[#9dffd9]",
    gold: "from-[#ffcd3c]/45 to-transparent text-[#ffe59c]",
    pink: "from-[#d8497f]/45 to-transparent text-[#ffb0d0]"
  };

  return (
    <GlassCard className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${tones[tone]} opacity-60`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/58">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{value}</p>
          {hint ? <p className="mt-2 text-xs text-white/42">{hint}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}
