"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { MEGA_LG_DOCK_CONFIG, megaLiquidGlassConfig, type MegaLiquidGlassOverrides } from "@/features/companion/liquid-glass/ybouaneGlassConfig";
import { useCompanionBackgroundOptional } from "@/features/companion/CompanionBackgroundContext";

type LiquidGlassInstance = {
  destroy: () => void;
  markChanged: () => void;
};

type MegaLiquidGlassContextValue = {
  /** Root LiquidGlass = capture + panneaux (enfants directs) */
  rootEl: HTMLElement | null;
  /** Alias : portails glass → même root (contrainte lib) */
  glassLayerEl: HTMLElement | null;
  registerGlass: (el: HTMLElement, overrides?: MegaLiquidGlassOverrides) => void;
  unregisterGlass: (el: HTMLElement) => void;
  markChanged: () => void;
};

const MegaLiquidGlassContext = createContext<MegaLiquidGlassContextValue | null>(null);

export function useMegaLiquidGlass() {
  const ctx = useContext(MegaLiquidGlassContext);
  if (!ctx) throw new Error("useMegaLiquidGlass must be used within MegaLiquidGlassProvider");
  return ctx;
}

export function useMegaLiquidGlassOptional() {
  return useContext(MegaLiquidGlassContext);
}

type ProviderProps = {
  scene: ReactNode;
  children: ReactNode;
};

type BgId = "cosmic" | "aurora" | "ember" | "dotgrid" | "spectrum" | "midnight" | "posters";

/** Peint le mesh MegaTv sur un canvas (capture WebGL) — invisible à l’écran (opacity 0). */
function paintCompanionMesh(canvas: HTMLCanvasElement, bg: BgId | string | undefined) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(window.innerWidth * dpr));
  const h = Math.max(1, Math.round(window.innerHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const theme = (bg || "ember") as BgId;

  if (theme === "midnight" || theme === "posters") {
    ctx.fillStyle = theme === "posters" ? "#06080a" : "#000000";
    ctx.fillRect(0, 0, w, h);
    return;
  }

  const gBase = ctx.createLinearGradient(0, 0, w * 0.2, h);
  if (theme === "aurora") {
    gBase.addColorStop(0, "#040806");
    gBase.addColorStop(0.5, "#0a100e");
    gBase.addColorStop(1, "#060808");
  } else if (theme === "cosmic") {
    gBase.addColorStop(0, "#06080c");
    gBase.addColorStop(0.45, "#0c1016");
    gBase.addColorStop(1, "#080b10");
  } else if (theme === "spectrum") {
    gBase.addColorStop(0, "#06080c");
    gBase.addColorStop(1, "#06080c");
  } else if (theme === "dotgrid") {
    gBase.addColorStop(0, "#050608");
    gBase.addColorStop(1, "#0a0c10");
  } else {
    gBase.addColorStop(0, "#0c0806");
    gBase.addColorStop(0.5, "#12100c");
    gBase.addColorStop(1, "#080606");
  }
  ctx.fillStyle = gBase;
  ctx.fillRect(0, 0, w, h);

  const radial = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };

  if (theme === "aurora") {
    radial(w * 0.2, h * 0.15, w * 0.55, "rgba(163, 230, 53, 0.22)");
    radial(w * 0.8, h * 0.8, w * 0.5, "rgba(63, 154, 230, 0.18)");
  } else if (theme === "cosmic") {
    radial(w * 0.15, 0, w * 0.55, "rgba(216, 73, 127, 0.24)");
    radial(w * 0.85, h * 0.1, w * 0.5, "rgba(63, 154, 230, 0.2)");
  } else if (theme === "spectrum") {
    radial(w * 0.1, h * 0.2, w * 0.45, "rgba(63, 154, 230, 0.22)");
    radial(w * 0.9, h * 0.3, w * 0.4, "rgba(216, 73, 127, 0.2)");
    radial(w * 0.5, h * 0.9, w * 0.4, "rgba(242, 180, 60, 0.14)");
  } else if (theme === "dotgrid") {
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    const step = 24 * dpr;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.arc(x + dpr, y + dpr, dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    radial(w * 0.3, h * 0.2, w * 0.5, "rgba(238, 106, 84, 0.24)");
    radial(w * 0.75, h * 0.75, w * 0.45, "rgba(242, 180, 60, 0.16)");
  }
}

/**
 * Architecture anti-stale (contrainte @ybouane/liquidglass) :
 * - Glass = enfants directs de `#mega-lg-root`
 * - Capture = canvas mesh opaque:0 (pixels lus via drawImage, pas le hero)
 * - Scène visuelle = sibling derrière l’UI
 * - App = hors root → jamais capturée
 */
export function MegaLiquidGlassProvider({ scene, children }: ProviderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<LiquidGlassInstance | null>(null);
  const glassRegistryRef = useRef<Map<HTMLElement, MegaLiquidGlassOverrides | undefined>>(new Map());
  const initGenRef = useRef(0);
  const initTimerRef = useRef<number | null>(null);
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);
  const companionBg = useCompanionBackgroundOptional()?.background;

  const refreshCaptureCanvas = useCallback(() => {
    const canvas = captureRef.current;
    if (!canvas) return;
    paintCompanionMesh(canvas, companionBg);
  }, [companionBg]);

  const scheduleInit = useCallback(
    (forceRecapture = false) => {
      const root = rootRef.current;
      if (!root) return;

      if (initTimerRef.current) window.clearTimeout(initTimerRef.current);
      const gen = ++initGenRef.current;

      initTimerRef.current = window.setTimeout(() => {
        void (async () => {
          refreshCaptureCanvas();
          const glassElements = Array.from(glassRegistryRef.current.keys()).filter(
            (el) => el.isConnected && el.parentElement === root
          );
          if (glassElements.length === 0 || gen !== initGenRef.current) return;

          if (instanceRef.current && !forceRecapture) {
            instanceRef.current.markChanged();
            return;
          }

          await document.fonts.ready;
          if (gen !== initGenRef.current) return;

          const ready = Array.from(glassRegistryRef.current.keys()).filter(
            (el) => el.isConnected && el.parentElement === root
          );
          if (ready.length === 0) return;

          try {
            if (instanceRef.current) {
              instanceRef.current.destroy();
              instanceRef.current = null;
            }
            const { LiquidGlass } = await import("@ybouane/liquidglass");
            if (gen !== initGenRef.current) return;
            instanceRef.current = await LiquidGlass.init({
              root,
              glassElements: ready,
              defaults: MEGA_LG_DOCK_CONFIG
            });
          } catch (error) {
            console.error("[MegaLiquidGlass] LiquidGlass.init failed", error);
          }
        })();
      }, 120);
    },
    [refreshCaptureCanvas]
  );

  const registerGlass = useCallback(
    (el: HTMLElement, overrides?: MegaLiquidGlassOverrides) => {
      const next = JSON.stringify(megaLiquidGlassConfig(overrides));
      const prev = el.dataset.config;
      const already = glassRegistryRef.current.has(el);
      el.dataset.config = next;
      el.setAttribute("data-mega-lg-glass", "true");
      glassRegistryRef.current.set(el, overrides);

      if (already && prev === next) {
        instanceRef.current?.markChanged();
        return;
      }

      if (instanceRef.current && (!already || prev !== next)) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
      scheduleInit(true);
    },
    [scheduleInit]
  );

  const unregisterGlass = useCallback(
    (el: HTMLElement) => {
      if (!glassRegistryRef.current.has(el)) return;
      glassRegistryRef.current.delete(el);
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
      scheduleInit();
    },
    [scheduleInit]
  );

  const markChanged = useCallback(() => {
    refreshCaptureCanvas();
    instanceRef.current?.markChanged();
  }, [refreshCaptureCanvas]);

  useEffect(() => {
    if (rootRef.current) setRootEl(rootRef.current);
  }, []);

  useEffect(() => {
    refreshCaptureCanvas();
    const timer = window.setTimeout(() => scheduleInit(true), 100);
    return () => window.clearTimeout(timer);
  }, [companionBg, refreshCaptureCanvas, scheduleInit]);

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        markChanged();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [markChanged]);

  useEffect(
    () => () => {
      if (initTimerRef.current) window.clearTimeout(initTimerRef.current);
      instanceRef.current?.destroy();
      instanceRef.current = null;
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      rootEl,
      glassLayerEl: rootEl,
      registerGlass,
      unregisterGlass,
      markChanged
    }),
    [rootEl, registerGlass, unregisterGlass, markChanged]
  );

  return (
    <MegaLiquidGlassContext.Provider value={contextValue}>
      {/* Scène visuelle — derrière l’UI, jamais dans le root de capture */}
      <div className="companion-lg-scene-visual" aria-hidden="true">
        <div className="companion-lg-scene">
          <div className="companion-lg-scene-mesh" />
          {scene}
        </div>
      </div>

      <div className="companion-lg-app">{children}</div>

      {/* Root WebGL : canvas mesh (opacity 0) + panneaux glass en enfants directs */}
      <div ref={rootRef} id="mega-lg-root" className="companion-lg-root">
        <canvas ref={captureRef} className="companion-lg-capture-canvas" aria-hidden="true" />
      </div>
    </MegaLiquidGlassContext.Provider>
  );
}
