"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type MediaDetailTarget = {
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  meta?: string | null;
  /** Pour layoutId flip */
  layoutId?: string;
};

type Ctx = {
  openMediaDetail: (target: MediaDetailTarget) => void;
  closeMediaDetail: () => void;
  target: MediaDetailTarget | null;
};

const MediaDetailContext = createContext<Ctx | null>(null);

export function useMediaDetail() {
  const ctx = useContext(MediaDetailContext);
  if (!ctx) throw new Error("useMediaDetail must be used within MediaDetailProvider");
  return ctx;
}

export function useMediaDetailOptional() {
  return useContext(MediaDetailContext);
}

export function MediaDetailProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<MediaDetailTarget | null>(null);

  const openMediaDetail = useCallback((next: MediaDetailTarget) => {
    if (!Number.isFinite(next.tmdbId) || next.tmdbId <= 0) return;
    setTarget(next);
  }, []);

  const closeMediaDetail = useCallback(() => setTarget(null), []);

  const value = useMemo(
    () => ({ openMediaDetail, closeMediaDetail, target }),
    [openMediaDetail, closeMediaDetail, target]
  );

  return <MediaDetailContext.Provider value={value}>{children}</MediaDetailContext.Provider>;
}
