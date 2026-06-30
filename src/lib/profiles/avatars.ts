import type { ProfileRow } from "@/lib/supabase/types";

export const TOTAL_AVATARS = 20;

export const PROFILE_COLORS = [
  0xffffffff,
  0xffe50914,
  0xfff59e0b,
  0xffffdd44,
  0xff1db954,
  0xff3b82f6,
  0xff6366f1,
  0xffec4899
] as const;

const avatarGradients: Record<number, [string, string]> = {
  1: ["#2A1800", "#3D2508"],
  2: ["#0A1520", "#152538"],
  3: ["#0A1A08", "#152A15"],
  4: ["#1A1810", "#2A2518"],
  5: ["#101A10", "#1A2A1A"],
  6: ["#1A1030", "#2A1A45"],
  7: ["#0A0A20", "#15153A"],
  8: ["#1A1A20", "#2A2A35"],
  9: ["#2A0A18", "#3A1025"],
  10: ["#2A1A08", "#3A2510"],
  11: ["#1A1A1A", "#2A2828"],
  12: ["#2A0A18", "#3A1025"],
  13: ["#101020", "#1A1A35"],
  14: ["#1A0A20", "#2A1535"],
  15: ["#2A2000", "#3A3008"],
  16: ["#0A1510", "#15251A"],
  17: ["#2A1008", "#3A1A10"],
  18: ["#1A1025", "#2A1A38"],
  19: ["#2A1020", "#3A1830"],
  20: ["#0A1520", "#152538"]
};

export function resolveAvatarId(avatarId?: number | null) {
  if (!avatarId || !Number.isFinite(avatarId)) return 1;
  const normalized = Math.trunc(avatarId);
  if (normalized >= 1 && normalized <= TOTAL_AVATARS) return normalized;
  if (normalized > TOTAL_AVATARS) return ((normalized - 1) % TOTAL_AVATARS) + 1;
  return 1;
}

export function avatarAssetPath(avatarId?: number | null) {
  return `/assets/avatars/avatar_${resolveAvatarId(avatarId)}.png`;
}

export function avatarGradientCss(avatarId?: number | null) {
  const [from, to] = avatarGradients[resolveAvatarId(avatarId)] || ["#1A1A1A", "#2D2D2D"];
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
