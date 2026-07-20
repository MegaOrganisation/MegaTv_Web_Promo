"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CompanionBackgroundId =
  | "cosmic"
  | "aurora"
  | "ember"
  | "dotgrid"
  | "spectrum"
  | "midnight"
  | "posters";

export const COMPANION_BACKGROUNDS: Array<{ id: CompanionBackgroundId; label: string; hint: string }> = [
  { id: "cosmic", label: "Cosmic", hint: "Halos rose / bleu — défaut MovieHub" },
  { id: "aurora", label: "Aurora", hint: "Orbes Spectrum MegaTv (landing)" },
  { id: "ember", label: "Ember", hint: "Ambre chaud ciné" },
  { id: "dotgrid", label: "Dot grid", hint: "Grille technique sombre" },
  { id: "spectrum", label: "Spectrum", hint: "Arc-en-ciel MegaTv discret" },
  { id: "midnight", label: "Midnight", hint: "Noir pur, glass maximal" },
  { id: "posters", label: "Posters flous", hint: "Même fond que le portail Connexion Cloud" }
];

const STORAGE_KEY = "megacompanion_ambient_bg_v1";

type Ctx = {
  background: CompanionBackgroundId;
  setBackground: (id: CompanionBackgroundId) => void;
  /** true seulement après lecture localStorage — pour UI active sans mismatch hydration */
  hydrated: boolean;
};

const CompanionBackgroundContext = createContext<Ctx | null>(null);

export function CompanionBackgroundProvider({ children }: { children: ReactNode }) {
  const [background, setBackgroundState] = useState<CompanionBackgroundId>("aurora");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CompanionBackgroundId | null;
      if (saved && COMPANION_BACKGROUNDS.some((b) => b.id === saved)) setBackgroundState(saved);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.companionBg = background;
  }, [background]);

  function setBackground(id: CompanionBackgroundId) {
    setBackgroundState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }

  return (
    <CompanionBackgroundContext.Provider value={{ background, setBackground, hydrated }}>
      {children}
    </CompanionBackgroundContext.Provider>
  );
}

export function useCompanionBackground() {
  const ctx = useContext(CompanionBackgroundContext);
  if (!ctx) throw new Error("useCompanionBackground outside provider");
  return ctx;
}

export function useCompanionBackgroundOptional() {
  return useContext(CompanionBackgroundContext);
}
