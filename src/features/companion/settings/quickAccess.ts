export type QuickAccessId = "dashboard" | "watchlist" | "manage" | "profiles" | "devices" | "settings" | "admin";

export const QUICK_ACCESS_OPTIONS: Array<{ id: QuickAccessId; label: string; href: string; adminOnly?: boolean }> = [
  { id: "dashboard", label: "Dashboard", href: "/companion" },
  { id: "watchlist", label: "Watchlist", href: "/companion/watchlist" },
  { id: "manage", label: "Gestion cloud", href: "/companion/manage" },
  { id: "profiles", label: "Profils", href: "/companion/profiles" },
  { id: "devices", label: "Appareils", href: "/companion/devices" },
  { id: "settings", label: "Réglages", href: "/companion/settings" },
  { id: "admin", label: "Console Admin", href: "/companion/admin", adminOnly: true }
];

export const QUICK_ACCESS_STORAGE_KEY = "megacompanion_quick_access_v1";

export function readQuickAccessId(): QuickAccessId {
  if (typeof window === "undefined") return "watchlist";
  try {
    const raw = localStorage.getItem(QUICK_ACCESS_STORAGE_KEY) as QuickAccessId | null;
    if (raw && QUICK_ACCESS_OPTIONS.some((o) => o.id === raw)) return raw;
  } catch {
    /* ignore */
  }
  return "watchlist";
}

export function writeQuickAccessId(id: QuickAccessId) {
  localStorage.setItem(QUICK_ACCESS_STORAGE_KEY, id);
}
