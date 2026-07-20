import { createClient } from "@/lib/supabase/server";

export async function requestForceSync(
  scopes: string[] = ["watchlist", "catalogs", "iptv", "settings", "addons", "devices"]
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("megacompanion_request_force_sync", { p_scopes: scopes });
  return { error: error?.message || null };
}
