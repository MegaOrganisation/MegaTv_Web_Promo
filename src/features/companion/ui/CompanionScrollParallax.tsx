"use client";

import { useEffect } from "react";

/** Parallax léger visionOS — variables CSS `--companion-scroll-y` pour fond ambient + rails. */
export function CompanionScrollParallax() {
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        document.documentElement.style.setProperty("--companion-scroll-y", String(y));
        document.documentElement.style.setProperty("--companion-scroll-parallax", `${y * 0.035}px`);
        document.documentElement.style.setProperty("--companion-ambient-parallax", `${y * 0.08}px`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
