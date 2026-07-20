/** Accent tokens derived from Android `Profile.avatarColor` (ARGB int in `avatar_color`). */

const FALLBACK = { r: 63, g: 154, b: 230 };

function clampByte(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function parseProfileRgb(avatarColor?: number | null) {
  if (avatarColor == null || avatarColor === 0 || avatarColor === 0xffffffff) {
    return FALLBACK;
  }
  return {
    r: (avatarColor >>> 16) & 0xff,
    g: (avatarColor >>> 8) & 0xff,
    b: avatarColor & 0xff
  };
}

function shift({ r, g, b }: { r: number; g: number; b: number }, amount: number) {
  return {
    r: clampByte(r + amount),
    g: clampByte(g + amount),
    b: clampByte(b + amount)
  };
}

function rgb({ r, g, b }: { r: number; g: number; b: number }) {
  return `${r}, ${g}, ${b}`;
}

/** CSS custom properties for `--mega-accent-*` (applied on `document.documentElement`). */
export function accentCssVarsFromProfileColor(avatarColor?: number | null): Record<string, string> {
  const base = parseProfileRgb(avatarColor);
  const bright = shift(base, 42);
  const deep = shift(base, -38);
  const baseRgb = rgb(base);
  const brightRgb = rgb(bright);
  const deepRgb = rgb(deep);

  return {
    "--mega-accent": `rgb(${baseRgb})`,
    "--mega-accent-bright": `rgb(${brightRgb})`,
    "--mega-accent-deep": `rgb(${deepRgb})`,
    "--mega-accent-gradient": `linear-gradient(135deg, rgb(${deepRgb}) 0%, rgb(${baseRgb}) 48%, rgb(${brightRgb}) 100%)`,
    "--mega-accent-glow": `0 10px 36px -10px rgba(${baseRgb}, 0.55)`,
    "--mega-accent-ring": `rgba(${baseRgb}, 0.38)`
  };
}
