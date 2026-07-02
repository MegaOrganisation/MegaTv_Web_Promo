"use client";

import { clsx } from "clsx";
import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme, type ThemeMode } from "@/features/theme/ThemeProvider";

const options: Array<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
  { mode: "light", label: "Clair", icon: Sun },
  { mode: "dark", label: "Sombre", icon: Moon },
  { mode: "system", label: "Auto", icon: Monitor }
];

export function ThemeSelector() {
  const { mode, setMode } = useTheme();

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map(({ mode: optionMode, label, icon: Icon }) => {
        const active = mode === optionMode;
        return (
          <button
            key={optionMode}
            type="button"
            onClick={() => setMode(optionMode)}
            className={clsx(
              "focus-ring flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
              active
                ? "border-[var(--mega-border-strong)] bg-[var(--mega-card-bg)] text-[var(--mega-text)]"
                : "border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-faint)] hover:text-[var(--mega-text)]"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
