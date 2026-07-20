import type { GlassConfig } from "@ybouane/liquidglass";

/**
 * Config dock nav — référence visuelle (playground ybouane).
 * À réutiliser pour boutons, popups et KPI colorés.
 */
export const MEGA_LG_DOCK_CONFIG: GlassConfig = {
  blurAmount: 0.22,
  refraction: 0.85,
  chromAberration: 0.07,
  edgeHighlight: 0.14,
  specular: 0.12,
  fresnel: 1,
  distortion: 0.06,
  cornerRadius: 32,
  zRadius: 32,
  opacity: 1,
  saturation: 0,
  tintStrength: 0,
  brightness: 0,
  shadowOpacity: 0.38,
  shadowSpread: 14,
  shadowOffsetY: 2,
  floating: false,
  button: false,
  bevelMode: 0
};

/** Alias historique — même rendu que le dock. */
export const MEGA_LG_PLAYGROUND_CONFIG: GlassConfig = { ...MEGA_LG_DOCK_CONFIG };

/** Boutons / pills — même glass + mode button (hover lift). */
export const MEGA_LG_BUTTON_CONFIG: GlassConfig = {
  ...MEGA_LG_DOCK_CONFIG,
  blurAmount: 0.2,
  refraction: 0.9,
  chromAberration: 0.08,
  edgeHighlight: 0.16,
  cornerRadius: 24,
  zRadius: 24,
  shadowOpacity: 0.4,
  button: true
};

/** Popups / modales. */
export const MEGA_LG_POPUP_CONFIG: GlassConfig = {
  ...MEGA_LG_DOCK_CONFIG,
  cornerRadius: 28,
  zRadius: 28,
  blurAmount: 0.24,
  refraction: 0.9,
  edgeHighlight: 0.16,
  floating: false
};

/** KPI teintés — glass dock + légère saturation (couleur via overlay CSS). */
export function megaLgKpiConfig(tone: "blue" | "teal" | "gold" | "pink"): GlassConfig {
  const tint =
    tone === "blue" ? 0.22 : tone === "teal" ? 0.14 : tone === "gold" ? 0.08 : 0.1;
  return {
    ...MEGA_LG_DOCK_CONFIG,
    cornerRadius: 24,
    zRadius: 24,
    tintStrength: tint,
    saturation: tone === "gold" || tone === "pink" ? 0.18 : 0.12,
    brightness: 0.04,
    blurAmount: 0.2,
    refraction: 0.88,
    edgeHighlight: 0.14
  };
}

export type MegaLiquidGlassOverrides = Partial<GlassConfig>;

export function megaLiquidGlassConfig(overrides?: MegaLiquidGlassOverrides): GlassConfig {
  return { ...MEGA_LG_DOCK_CONFIG, ...overrides };
}
