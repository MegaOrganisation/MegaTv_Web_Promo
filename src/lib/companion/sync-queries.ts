import { createClient } from "@/lib/supabase/server";
import type { AddonsSliceData, CatalogsSliceData, CompanionAddon, CompanionCatalog } from "@/lib/companion/sync-types";

function parseJsonArray<T>(value: unknown, profileId: string): T[] {
  if (!value || typeof value !== "object") return [];
  const map = value as Record<string, unknown>;
  const raw = map[profileId];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];
  return [];
}

function parseStringArray(value: unknown, profileId: string): string[] {
  const items = parseJsonArray<string>(value, profileId);
  return items.map((item) => String(item)).filter(Boolean);
}

export async function getAddonsSlice(profileId: string): Promise<AddonsSliceData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_account_sync_addons")
    .select("addons_by_profile, hidden_built_in_addons_by_profile, addons_updated_at")
    .maybeSingle();

  if (error || !data) {
    return { addons: [], hiddenBuiltIn: [], addonsUpdatedAt: 0 };
  }

  return {
    addons: parseJsonArray<CompanionAddon>(data.addons_by_profile, profileId),
    hiddenBuiltIn: parseStringArray(data.hidden_built_in_addons_by_profile, profileId),
    addonsUpdatedAt: Number(data.addons_updated_at || 0)
  };
}

export async function getCatalogsSlice(profileId: string): Promise<CatalogsSliceData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_account_sync_catalogs")
    .select(
      "catalogs_by_profile, hidden_preinstalled_by_profile, deleted_catalog_ids_by_profile, catalogs_updated_at"
    )
    .maybeSingle();

  if (error || !data) {
    return { catalogs: [], hiddenPreinstalled: [], deletedCatalogIds: [], catalogsUpdatedAt: 0 };
  }

  return {
    catalogs: parseJsonArray<CompanionCatalog>(data.catalogs_by_profile, profileId),
    hiddenPreinstalled: parseStringArray(data.hidden_preinstalled_by_profile, profileId),
    deletedCatalogIds: parseStringArray(data.deleted_catalog_ids_by_profile, profileId),
    catalogsUpdatedAt: Number(data.catalogs_updated_at || 0)
  };
}
