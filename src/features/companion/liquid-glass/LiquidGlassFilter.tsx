"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Filtre SVG edge-refraction (pattern LeonardSEO/liquid-glass-react + feTurbulence).
 * Chromium : backdrop-filter url(#mega-lg-displace) ; Safari/Firefox : blur seul (dégradation auto).
 */
export function LiquidGlassFilter() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <svg aria-hidden="true" className="mega-lg-svg-defs" focusable="false">
      <defs>
        <filter id="mega-lg-displace" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="8" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.2" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="glass-blur" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.007" numOctaves="1" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="mega-lg-shimmer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="38%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="62%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
        </linearGradient>
      </defs>
    </svg>,
    document.body
  );
}
