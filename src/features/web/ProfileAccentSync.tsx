"use client";

import { useEffect } from "react";

import { useWebProfile } from "@/features/web/WebProfileProvider";
import { accentCssVarsFromProfileColor } from "@/lib/profiles/profile-accent";

/** Pushes active profile `avatar_color` into `--mega-accent-*` CSS variables. */
export function ProfileAccentSync() {
  const { activeProfile } = useWebProfile();

  useEffect(() => {
    const vars = accentCssVarsFromProfileColor(activeProfile?.avatar_color);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
      }
    };
  }, [activeProfile?.avatar_color]);

  return null;
}
