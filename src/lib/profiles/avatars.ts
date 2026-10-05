import type { ProfileRow } from "@/lib/supabase/types";
import { loadAvatarRegistry, resolveAvatarIdFromRegistry } from "@/lib/profiles/avatar-registry";

const registry = loadAvatarRegistry();

export const TOTAL_AVATARS = registry.totalAvatars;
export const AVATAR_REGISTRY = registry;

const avatarGradients: Record<number, [string, string]> = {
  1: ["#2A2000", "#3D3010"],
  2: ["#1A0A28", "#2A1540"],
  3: ["#0A1528", "#152545"],
  4: ["#280A0A", "#401010"],
  5: ["#0A1A10", "#152A18"],
  6: ["#0A2020", "#153535"],
  7: ["#2A1500", "#3D2208"],
  8: ["#1A0A28", "#2A1540"],
  9: ["#0A1530", "#152545"],
  10: ["#0A1810", "#152818"],
  11: ["#0A1828", "#152840"],
  12: ["#0A1A12", "#152A1A"],
  13: ["#150A28", "#251540"],
  14: ["#141820", "#1E2835"],
  15: ["#1A1408", "#2A2010"],
  16: ["#2A1200", "#3D1A08"],
  17: ["#0A1810", "#152818"],
  18: ["#0A1028", "#151A40"],
  19: ["#280A18", "#401025"],
  20: ["#2A2000", "#3D3010"]
};

export function resolveAvatarId(avatarId?: number | null) {
  return resolveAvatarIdFromRegistry(avatarId, registry);
}

export function avatarAssetPath(avatarId?: number | null) {
  return `/assets/avatars/avatar_${resolveAvatarId(avatarId)}.png`;
}

export function avatarGradientCss(avatarId?: number | null) {
  const resolved = resolveAvatarId(avatarId);
  const [from, to] = avatarGradients[resolved] || ["#1A1A1A", "#2D2D2D"];
  return `linear-gradient(145deg, ${from}, ${to})`;
}

export function profileColorToCss(value?: number | null) {
  if (value === null || value === undefined) return "linear-gradient(135deg,#3f9ae6,#d8497f)";
  const hex = (value >>> 0).toString(16).padStart(8, "0").slice(-6);
  return `#${hex}`;
}

export function isLightProfileColor(value?: number | null) {
  if (value === null || value === undefined) return false;
  const r = (value >>> 16) & 0xff;
  const g = (value >>> 8) & 0xff;
  const b = value & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65;
}

export function profileInitial(profile: Pick<ProfileRow, "name"> | string | null | undefined) {
  const name = typeof profile === "string" ? profile : profile?.name;
  return (name || "Profil").trim().charAt(0).toUpperCase() || "P";
}
