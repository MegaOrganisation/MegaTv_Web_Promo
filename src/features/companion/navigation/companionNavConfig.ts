import type { MegaTvIconName } from "@/components/icons/MegaTvIcon";

export type CompanionDockRoute = {
  href: string;
  label: string;
  shortLabel: string;
  icon: MegaTvIconName;
  exact?: boolean;
};

/** Routes primaires — dock gauche (desktop) + bottom bar (mobile). */
export const COMPANION_DOCK_ROUTES: CompanionDockRoute[] = [
  { href: "/companion", label: "Dashboard", shortLabel: "Home", icon: "home", exact: true },
  { href: "/companion/watchlist", label: "Watchlist", shortLabel: "List", icon: "bookmark" },
  { href: "/companion/calendar", label: "Calendrier", shortLabel: "Cal.", icon: "calendar" },
  { href: "/companion/manage", label: "Gérer", shortLabel: "Gérer", icon: "cloud" },
  { href: "/companion/profiles", label: "Profils", shortLabel: "Profils", icon: "people" },
  { href: "/companion/settings", label: "Réglages", shortLabel: "Régl.", icon: "settings", exact: true }
];

export const COMPANION_ADMIN_ROUTE: CompanionDockRoute = {
  href: "/companion/admin",
  label: "Admin",
  shortLabel: "Admin",
  icon: "shield",
  exact: true
};

export type CompanionRailVariant = "dashboard" | "watchlist" | "manage" | "settings" | "profiles" | "admin" | "none";

export function companionRailVariantFromPath(pathname: string): CompanionRailVariant {
  if (pathname === "/companion") return "dashboard";
  if (pathname.startsWith("/companion/watchlist")) return "watchlist";
  if (pathname.startsWith("/companion/calendar")) return "dashboard";
  if (pathname.startsWith("/companion/manage")) return "manage";
  if (pathname.startsWith("/companion/settings") || pathname.startsWith("/companion/devices")) return "settings";
  if (pathname.startsWith("/companion/profiles")) return "profiles";
  if (pathname.startsWith("/companion/admin")) return "admin";
  return "none";
}

export function isCompanionRouteActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
