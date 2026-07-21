import { createClient } from "@/lib/supabase/server";
import { FORCE_SYNC_ALL_SCOPES } from "@/lib/companion/force-sync-scopes";

export { FORCE_SYNC_ALL_SCOPES };

export async function requestForceSync(
  scopes: string[] = [...FORCE_SYNC_ALL_SCOPES]
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("megacompanion_request_force_sync", { p_scopes: scopes });
  return { error: error?.message || null };
}
