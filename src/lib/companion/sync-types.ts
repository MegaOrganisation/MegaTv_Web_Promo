export type CompanionAddon = {
  id: string;
  name: string;
  version: string;
  description: string;
  isInstalled: boolean;
  isEnabled: boolean;
  type: "OFFICIAL" | "COMMUNITY" | "SUBTITLE" | "METADATA" | "CUSTOM";
  runtimeKind?: "STREMIO";
  installSource?: "DIRECT_URL";
  url?: string | null;
  logo?: string | null;
  transportUrl?: string | null;
};

export type CatalogSourceType = "PREINSTALLED" | "TRAKT" | "MDBLIST" | "ADDON" | "HOME_SERVER";
export type CatalogKind = "STANDARD" | "COLLECTION" | "COLLECTION_RAIL";

export type CompanionCatalog = {
  id: string;
  title: string;
  sourceType: CatalogSourceType;
  sourceUrl?: string | null;
  sourceRef?: string | null;
  isPreinstalled?: boolean;
  addonId?: string | null;
  addonCatalogType?: string | null;
  addonCatalogId?: string | null;
  addonName?: string | null;
  kind?: CatalogKind;
  collectionGroup?: string | null;
};

export type AddonsSliceData = {
  addons: CompanionAddon[];
  hiddenBuiltIn: string[];
  addonsUpdatedAt: number;
};

export type CatalogsSliceData = {
  catalogs: CompanionCatalog[];
  hiddenPreinstalled: string[];
  deletedCatalogIds: string[];
  catalogsUpdatedAt: number;
};

export type VersionManifest = {
  versionCode: number;
  versionName: string;
  url: string;
  features: string[];
  fixes: string[];
  improvements: string[];
};

export type PlatformConfigRevision = {
  id: string;
  revision: number;
  scope: "addons" | "iptv" | "catalogs" | "defaults";
  payload_jsonb: Record<string, unknown>;
  mandatory_on_boot: boolean;
  published_at: string;
  published_by: string | null;
};
