export const COMPANION_PROFILE_STORAGE_KEY = "megacompanion_active_profile_id";

export function readStoredProfileId() {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(COMPANION_PROFILE_STORAGE_KEY)?.trim();
  return value || null;
}

export function writeStoredProfileId(profileId: string | null) {
  if (typeof window === "undefined") return;
  if (!profileId) window.localStorage.removeItem(COMPANION_PROFILE_STORAGE_KEY);
  else window.localStorage.setItem(COMPANION_PROFILE_STORAGE_KEY, profileId);
}

/**
 * Ajoute/retire `?profile=` sans casser le hash.
 * Avant : `/companion#activity` → `/companion#activity?profile=…` (hash mort).
 * Après : `/companion?profile=…#activity`
 */
export function withProfileQuery(href: string, profileId?: string | null) {
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const qIndex = withoutHash.indexOf("?");
  const path = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
  const search = qIndex >= 0 ? withoutHash.slice(qIndex + 1) : "";
  const params = new URLSearchParams(search);
  if (profileId) params.set("profile", profileId);
  else params.delete("profile");
  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hash}`;
}
