"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";

import type { AdminPeriodDays } from "@/lib/admin/period";

const options: Array<{ days: AdminPeriodDays; label: string }> = [
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "90 jours" }
];

export function AdminPeriodSelector({ activeDays }: { activeDays: AdminPeriodDays }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setDays = (days: AdminPeriodDays) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", String(days));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ days, label }) => (
        <button
          key={days}
          type="button"
          onClick={() => setDays(days)}
          className={clsx(
            "focus-ring rounded-full border px-4 py-2 text-sm font-semibold transition",
            activeDays === days
              ? "border-white/30 bg-white/14 text-white"
              : "border-white/10 bg-white/[0.045] text-white/55 hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
