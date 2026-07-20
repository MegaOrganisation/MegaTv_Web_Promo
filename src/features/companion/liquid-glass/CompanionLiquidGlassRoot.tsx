"use client";

import Script from "next/script";
import { useEffect, type ReactNode } from "react";

import { LiquidGlassFilters } from "@/features/companion/liquid-glass/LiquidGlassFilters";

/** Active le design system premium Companion (tokens + mesh + SVG distort). */
export function CompanionLiquidGlassRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.megaSurface = "companion";
    return () => {
      delete document.documentElement.dataset.megaSurface;
    };
  }, []);

  return (
    <>
      <Script id="mega-companion-surface" strategy="beforeInteractive">
        {`document.documentElement.setAttribute('data-mega-surface','companion');`}
      </Script>
      <LiquidGlassFilters />
      {children}
    </>
  );
}
