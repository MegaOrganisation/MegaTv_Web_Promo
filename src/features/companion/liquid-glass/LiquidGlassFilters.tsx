/** SVG refraction filters — web approximation of Apple Liquid Glass (not an Apple API). */
export function LiquidGlassFilters() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed h-0 w-0 overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="mega-lg-refraction-soft" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="8" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="mega-lg-refraction-edge" x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.04" numOctaves="3" seed="12" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="mega-glass-distort" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="mega-lg-chroma-edge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(63,154,230,0.35)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="65%" stopColor="rgba(31,168,160,0.28)" />
          <stop offset="100%" stopColor="rgba(216,73,127,0.32)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
