"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { extractPosterColor, rgbToCss } from "@/features/companion/ui/extractPosterColor";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";

type AmbientState = {
  rgb: string;
  imageUrl: string | null;
  opacity: number;
};

type PosterAmbientContextValue = {
  ambient: AmbientState;
  setFromPoster: (posterUrl: string | null, backdropUrl?: string | null) => void;
  clearAmbient: () => void;
};

const defaultRgb = "63, 154, 230";

const PosterAmbientContext = createContext<PosterAmbientContextValue | null>(null);

export function PosterAmbientProvider({ children }: { children: ReactNode }) {
  const [ambient, setAmbient] = useState<AmbientState>({ rgb: defaultRgb, imageUrl: null, opacity: 0 });

  useEffect(() => {
    document.documentElement.classList.toggle("has-poster-ambient", ambient.opacity > 0);
    return () => document.documentElement.classList.remove("has-poster-ambient");
  }, [ambient.opacity]);

  const setFromPoster = useCallback(async (posterUrl: string | null, backdropUrl?: string | null) => {
    const poster = posterUrl ? (tmdbProxiedImageUrl(posterUrl, "w342") ?? posterUrl) : null;
    const backdrop = backdropUrl ? (tmdbProxiedImageUrl(backdropUrl, "w780") ?? backdropUrl) : null;
    const imageUrl = backdrop || poster;
    if (!imageUrl) {
      setAmbient({ rgb: defaultRgb, imageUrl: null, opacity: 0 });
      return;
    }
    const rgb = rgbToCss(await extractPosterColor(poster || imageUrl));
    setAmbient({ rgb, imageUrl, opacity: 1 });
  }, []);

  const clearAmbient = useCallback(() => {
    setAmbient((current) => ({ ...current, opacity: 0 }));
  }, []);

  const value = useMemo(() => ({ ambient, setFromPoster, clearAmbient }), [ambient, setFromPoster, clearAmbient]);

  return <PosterAmbientContext.Provider value={value}>{children}</PosterAmbientContext.Provider>;
}

export function usePosterAmbient() {
  const ctx = useContext(PosterAmbientContext);
  if (!ctx) throw new Error("usePosterAmbient requires PosterAmbientProvider");
  return ctx;
}

export function PosterAmbientBackdrop() {
  const { ambient } = usePosterAmbient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="poster-ambient-backdrop"
      aria-hidden="true"
      style={
        {
          "--poster-ambient-rgb": ambient.rgb,
          "--poster-ambient-opacity": ambient.opacity
        } as CSSProperties
      }
    >
      {ambient.imageUrl ? <img src={ambient.imageUrl} alt="" className="poster-ambient-image" /> : null}
    </div>,
    document.body
  );
}
