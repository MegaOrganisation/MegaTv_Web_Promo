import type { CompanionCatalog } from "@/lib/companion/sync-types";

const POSTER_RAIL_GROUPS = ["SERVICE", "GENRE", "FRANCHISE"] as const;
const RAIL_IDS: Record<(typeof POSTER_RAIL_GROUPS)[number], string> = {
  SERVICE: "collection_rail_service",
  GENRE: "collection_rail_genre",
  FRANCHISE: "collection_rail_franchise"
};

const RAIL_TITLES: Record<(typeof POSTER_RAIL_GROUPS)[number], string> = {
  SERVICE: "Services",
  GENRE: "Genres",
  FRANCHISE: "Franchises"
};

function isPosterCollectionRail(catalog: CompanionCatalog) {
  return catalog.kind === "COLLECTION_RAIL" && POSTER_RAIL_GROUPS.includes((catalog.collectionGroup || "") as (typeof POSTER_RAIL_GROUPS)[number]);
}

export function isHiddenFromSettingsPanel(catalog: CompanionCatalog) {
  if (catalog.kind === "COLLECTION") return true;
  if (catalog.kind === "COLLECTION_RAIL" && !isPosterCollectionRail(catalog)) return true;
  if (catalog.id.startsWith("collection_franchise_")) return true;
  if (catalog.id.startsWith("collection_service_") || catalog.id.startsWith("collection_genre_")) return true;
  return false;
}

export function catalogsForSettingsPanel(catalogs: CompanionCatalog[]) {
  const parentRailByGroup = Object.fromEntries(
    POSTER_RAIL_GROUPS.map((group) => [
      group,
      catalogs.find((catalog) => isPosterCollectionRail(catalog) && catalog.collectionGroup === group) ||
        syntheticPosterRail(group)
    ])
  ) as Record<(typeof POSTER_RAIL_GROUPS)[number], CompanionCatalog>;

  const emitted = new Set<string>();
  const output: CompanionCatalog[] = [];

  catalogs.forEach((catalog) => {
    if (isHiddenFromSettingsPanel(catalog)) return;
    if (isPosterCollectionRail(catalog)) {
      const group = catalog.collectionGroup as (typeof POSTER_RAIL_GROUPS)[number];
      if (!emitted.has(group)) {
        emitted.add(group);
        output.push(parentRailByGroup[group]);
      }
      return;
    }
    output.push(catalog);
  });

  POSTER_RAIL_GROUPS.forEach((group) => {
    if (!emitted.has(group)) output.push(parentRailByGroup[group]);
  });

  return output;
}

function syntheticPosterRail(group: (typeof POSTER_RAIL_GROUPS)[number]): CompanionCatalog {
  return {
    id: RAIL_IDS[group],
    title: RAIL_TITLES[group],
    sourceType: "PREINSTALLED",
    isPreinstalled: true,
    kind: "COLLECTION_RAIL",
    collectionGroup: group
  };
}

export function isPreinstalledSourceLocked(catalog: CompanionCatalog) {
  return Boolean(catalog.isPreinstalled) || catalog.sourceType === "PREINSTALLED";
}
