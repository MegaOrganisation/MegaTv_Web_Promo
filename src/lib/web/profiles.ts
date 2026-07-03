import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

/**
 * Lightweight profile read for the web client shell/gate.
 * Free Tier rule: single slice-view read, no summary/top/continue RPCs,
 * no monolithic payload — unlike `getDashboardData`.
 */
export async function getWebProfiles(): Promise<ProfileRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_megacompanion_user_profiles")
    .select("*")
    .order("last_used_at", { ascending: false, nullsFirst: false });
  return (data || []) as ProfileRow[];
}
