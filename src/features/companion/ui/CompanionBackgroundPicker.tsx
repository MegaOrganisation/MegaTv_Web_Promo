"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

import { COMPANION_BACKGROUNDS, useCompanionBackground } from "@/features/companion/CompanionBackgroundContext";
import { QUICK_ACCESS_OPTIONS, readQuickAccessId, writeQuickAccessId, type QuickAccessId } from "@/features/companion/settings/quickAccess";

export function CompanionBackgroundPicker() {
  const { background, setBackground, hydrated } = useCompanionBackground();

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {COMPANION_BACKGROUNDS.map((preset) => {
        /* Pas d’is-active avant hydration — évite mismatch SSR/localStorage */
        const active = hydrated && background === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => setBackground(preset.id)}
            className={clsx("companion-bg-swatch focus-ring", active && "is-active")}
            data-bg-preview={preset.id}
            aria-pressed={active}
          >
            <span className="companion-bg-swatch__preview" aria-hidden="true" />
            <span className="block text-left">
              <span className="block text-sm font-bold text-white/90">{preset.label}</span>
              <span className="mt-0.5 block text-xs text-white/45">{preset.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function QuickAccessSelector({ isAdmin }: { isAdmin?: boolean }) {
  const options = QUICK_ACCESS_OPTIONS.filter((o) => !o.adminOnly || isAdmin);
  const [value, setValue] = useState<QuickAccessId>("watchlist");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readQuickAccessId());
    setHydrated(true);
  }, []);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => {
            writeQuickAccessId(opt.id);
            setValue(opt.id);
          }}
          className={clsx(
            "focus-ring rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
            hydrated && value === opt.id
              ? "border-white/22 bg-white/10 text-white"
              : "border-white/10 bg-white/5 text-white/55 hover:text-white/85"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
