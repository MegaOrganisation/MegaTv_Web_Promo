import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/env";

export function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function createServiceClient() {
  const { supabaseUrl } = getPublicSupabaseEnv();
  const serviceKey = getServiceRoleKey();
  if (!serviceKey) return null;

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export const OTA_VERSION_JSON_URL =
  "https://lciimaytmryruyooktkd.supabase.co/storage/v1/object/public/updates/version.json";

export const OTA_GITHUB_REPO = "MegaOrganisation/MegaTv_Web_Auth";
