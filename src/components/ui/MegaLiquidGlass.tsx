"use client";

import { clsx } from "clsx";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useMegaLiquidGlassOptional } from "@/features/companion/liquid-glass/MegaLiquidGlassProvider";
import type { MegaLiquidGlassOverrides } from "@/features/companion/liquid-glass/ybouaneGlassConfig";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** @deprecated */
  filterId?: string;
  /** @deprecated */
  intensity?: "subtle" | "vivid" | "vision";
  borderRadius?: string;
  configOverrides?: MegaLiquidGlassOverrides;
  fixedSize?: boolean;
};

/**
 * Panneau liquid glass — porté en enfant direct de `#mega-lg-root`
 * (contrainte @ybouane/liquidglass). Capture = canvas mesh, jamais le hero.
 */
export function MegaLiquidGlass({ children, className, style, configOverrides, fixedSize = false }: Props) {
  const ctx = useMegaLiquidGlassOptional();
  const spacerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const floating = Boolean(configOverrides?.floating);
  const portalTarget = ctx?.rootEl ?? ctx?.glassLayerEl;

  const stableOverrides = useMemo(() => configOverrides, [JSON.stringify(configOverrides ?? null)]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el || !ctx || !portalTarget || !mounted) return;
    if (el.parentElement !== portalTarget) return;

    ctx.registerGlass(el, stableOverrides);
    return () => ctx.unregisterGlass(el);
  }, [ctx, stableOverrides, mounted, portalTarget]);

  useLayoutEffect(() => {
    if (!mounted || !portalTarget || !ctx) return;
    const spacer = spacerRef.current;
    const panel = panelRef.current;
    if (!spacer || !panel) return;

    let raf = 0;
    let lastKey = "";
    let lastSizeKey = "";

    const sync = () => {
      if (!fixedSize) {
        const content = panel.querySelector(".mega-lg-glass-panel__content") as HTMLElement | null;
        const h = Math.max(1, Math.round(content?.scrollHeight || panel.scrollHeight || spacer.offsetHeight));
        if (Math.abs(spacer.offsetHeight - h) > 1) {
          spacer.style.height = `${h}px`;
        }
      }

      const r = spacer.getBoundingClientRect();
      if (r.width < 1 && r.height < 1) return;
      const left = Math.round(r.left);
      const top = Math.round(r.top);
      const width = Math.max(1, Math.round(r.width));
      const height = Math.max(1, Math.round(r.height));
      const key = `${left},${top},${width},${height}`;
      if (key === lastKey) return;
      lastKey = key;
      panel.style.position = "fixed";
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.width = `${width}px`;
      panel.style.height = `${height}px`;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.style.margin = "0";
      if (!floating) panel.style.transform = "none";

      const sizeKey = `${width},${height}`;
      if (sizeKey !== lastSizeKey) {
        lastSizeKey = sizeKey;
        ctx.markChanged();
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };

    sync();
    if (floating) return;

    const ro = new ResizeObserver(schedule);
    ro.observe(spacer);
    const content = panel.querySelector(".mega-lg-glass-panel__content");
    if (content) ro.observe(content);
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("scroll", schedule, { capture: true, passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      document.removeEventListener("scroll", schedule, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mounted, ctx, portalTarget, className, floating, fixedSize]);

  if (!mounted || !portalTarget) {
    return (
      <div className={clsx("mega-lg-glass-fallback", className)} style={style}>
        <div className="mega-lg-glass-panel__content">{children}</div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={spacerRef}
        className={clsx("mega-lg-glass-spacer", className)}
        style={style}
        aria-hidden
        suppressHydrationWarning
      />
      {createPortal(
        <div ref={panelRef} className={clsx("mega-lg-glass-panel", className)} style={style}>
          <div className="mega-lg-glass-panel__content">{children}</div>
        </div>,
        portalTarget
      )}
    </>
  );
}
