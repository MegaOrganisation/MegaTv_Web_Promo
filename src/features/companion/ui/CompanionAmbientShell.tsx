"use client";

import type { ReactNode } from "react";

import { useCompanionBackgroundOptional } from "@/features/companion/CompanionBackgroundContext";
import { CompanionSettingsScene } from "@/features/companion/liquid-glass/CompanionSettingsScene";
import { CompanionPosterBackdrop } from "@/features/companion/liquid-glass/CompanionPosterBackdrop";
import { MegaLiquidGlassProvider } from "@/features/companion/liquid-glass/MegaLiquidGlassProvider";
import { CompanionAmbientMotion } from "@/features/companion/ui/CompanionAmbientMotion";
import { MediaDetailProvider } from "@/features/companion/ui/MediaDetailContext";
import { MediaFlipDetailModal } from "@/features/companion/ui/MediaFlipDetailModal";
import { PosterAmbientProvider } from "@/features/companion/ui/PosterAmbientContext";

function AmbientLayers() {
  const bg = useCompanionBackgroundOptional()?.background ?? "aurora";
  const posters = bg === "posters";

  return (
    <>
      {posters ? <CompanionPosterBackdrop /> : null}
      <div
        className="companion-aurora-backdrop"
        data-bg={bg}
        aria-hidden
        style={posters ? { opacity: 0.22 } : undefined}
      >
        <div className="aurora a1" />
        <div className="aurora a2" />
        <div className="aurora a3" />
        <div className="aurora a4" />
      </div>
      {!posters ? <div className="companion-aurora-grid" aria-hidden /> : null}
    </>
  );
}

/** Shell ambient — fond configurable + détail média. */
export function CompanionAmbientShell({ children }: { children: ReactNode }) {
  return (
    <PosterAmbientProvider>
      <MegaLiquidGlassProvider
        scene={
          <>
            <CompanionSettingsScene />
            <CompanionAmbientMotion />
          </>
        }
      >
        <MediaDetailProvider>
          <AmbientLayers />
          <div className="companion-ambient-root relative min-h-screen" suppressHydrationWarning>
            {children}
          </div>
          <MediaFlipDetailModal />
        </MediaDetailProvider>
      </MegaLiquidGlassProvider>
    </PosterAmbientProvider>
  );
}
