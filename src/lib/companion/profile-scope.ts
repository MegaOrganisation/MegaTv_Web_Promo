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

export function withProfileQuery(href: string, profileId?: string | null) {
  const [path, search = ""] = href.split("?");
  const params = new URLSearchParams(search);
  if (profileId) params.set("profile", profileId);
  else params.delete("profile");
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
