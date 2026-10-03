"use client";

import Script from "next/script";
import { useEffect, type ReactNode } from "react";

import { LiquidGlassFilters } from "@/features/companion/liquid-glass/LiquidGlassFilters";

export function CompanionLiquidGlassRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.megaSurface = "companion";
    return () => {
      delete document.documentElement.dataset.megaSurface;
    };
  }, []);

  return (
    <>
      <LiquidGlassFilters />
      {children}
    </>
  );
}
