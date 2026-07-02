import manifest from "@/../public/assets/avatars/manifest.json";

export type AvatarCategory = {
  label: string;
  ids: number[];
};

export type AvatarRegistry = {
  version: number;
  categories: AvatarCategory[];
  totalAvatars: number;
  allIds: number[];
};

export function loadAvatarRegistry(): AvatarRegistry {
  const categories = (manifest.categories || []) as AvatarCategory[];
  const allIds = [...new Set(categories.flatMap((category) => category.ids))].sort((a, b) => a - b);
  return {
    version: manifest.version || 1,
    categories,
    totalAvatars: allIds.length > 0 ? Math.max(...allIds) : 20,
    allIds
  };
}

export function resolveAvatarIdFromRegistry(avatarId: number | null | undefined, registry: AvatarRegistry) {
  if (!avatarId || !Number.isFinite(avatarId)) return registry.allIds[0] || 1;
  const normalized = migrateLegacyAvatarId(Math.trunc(avatarId));
  if (registry.allIds.includes(normalized)) return normalized;
  if (normalized > 0 && registry.totalAvatars > 0) {
    return registry.allIds[((normalized - 1) % registry.allIds.length)] || registry.allIds[0] || 1;
  }
  return registry.allIds[0] || 1;
}

/** Maps pre–juillet 2026 slots to Mega categories (same index within old row). */
export function migrateLegacyAvatarId(avatarId: number) {
  if (avatarId >= 1 && avatarId <= 5) return avatarId + 15;
  if (avatarId >= 6 && avatarId <= 10) return avatarId - 5;
  if (avatarId >= 11 && avatarId <= 15) return avatarId;
  if (avatarId >= 16 && avatarId <= 20) return avatarId - 10;
  return avatarId;
}
