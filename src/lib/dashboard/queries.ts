import { createClient } from "@/lib/supabase/server";
import type { ContinueWatchingRow, DashboardSummary, DeviceRow, ProfileRow, TopContentRow } from "@/lib/supabase/types";

const defaultSummary: DashboardSummary = {
  profile_count: 0,
  device_count: 0,
  continue_watching_count: 0,
  movies_watched: 0,
  episodes_watched: 0,
  total_watch_seconds: 0,
  page_views_30d: 0,
  last_activity_at: null
};

export async function getDashboardData(profileId?: string | null, options: { deviceLimit?: number } = {}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const requestedProfileId = profileId?.trim() || null;
  const deviceLimit = options.deviceLimit ?? 8;

  const [profilesResult, devicesResult, adminResult] = await Promise.all([
    supabase.from("v_megacompanion_user_profiles").select("*").order("last_used_at", { ascending: false, nullsFirst: false }),
    supabase.from("v_megacompanion_devices").select("*").order("last_seen_at", { ascending: false, nullsFirst: false }).limit(deviceLimit),
    supabase.rpc("megacompanion_is_admin")
  ]);

  const profiles = (profilesResult.data || []) as ProfileRow[];
  const normalizedProfileId = requestedProfileId && profiles.some((profile) => profile.profile_id === requestedProfileId) ? requestedProfileId : null;
  const activeProfile = normalizedProfileId ? profiles.find((profile) => profile.profile_id === normalizedProfileId) || null : null;

  let continueQuery = supabase
    .from("v_megacompanion_continue_watching")
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(8);

  if (normalizedProfileId) {
    continueQuery = continueQuery.eq("profile_id", normalizedProfileId);
  }

  const [summaryResult, topContentResult, continueResult] = await Promise.all([
    supabase.rpc("megacompanion_user_summary", { p_profile_id: normalizedProfileId }).maybeSingle(),
    supabase.rpc("megacompanion_user_top_content", { p_profile_id: normalizedProfileId, p_limit: 5 }),
    continueQuery
  ]);

  const profileAvatarUrlsById = user ? await createProfileAvatarUrls(supabase, user.id, profiles) : {};

  return {
    activeProfileId: normalizedProfileId,
    activeProfile,
    summary: (summaryResult.data as DashboardSummary | null) || defaultSummary,
    topContent: (topContentResult.data || []) as TopContentRow[],
    profiles,
    profileAvatarUrlsById,
    devices: (devicesResult.data || []) as DeviceRow[],
    continueWatching: (continueResult.data || []) as ContinueWatchingRow[],
    isAdmin: Boolean(adminResult.data),
    errors: [summaryResult.error, topContentResult.error, profilesResult.error, devicesResult.error, continueResult.error].filter(Boolean).map((error) => error?.message || "Erreur Supabase")
  };
}

export async function getAdminDashboardData() {
  const supabase = await createClient();
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [overview, topContent, pageAnalytics] = await Promise.all([
    supabase.rpc("megacompanion_admin_overview", { from_ts: from.toISOString(), to_ts: to.toISOString() }).maybeSingle(),
    supabase.rpc("megacompanion_admin_top_content", { from_ts: from.toISOString(), to_ts: to.toISOString(), p_limit: 10 }),
    supabase.rpc("megacompanion_admin_page_analytics", { from_ts: from.toISOString(), to_ts: to.toISOString() })
  ]);

  return {
    overview: overview.data,
    topContent: topContent.data || [],
    pageAnalytics: pageAnalytics.data || [],
    errors: [overview.error, topContent.error, pageAnalytics.error].filter(Boolean).map((error) => error?.message || "Erreur Supabase")
  };
}

async function createProfileAvatarUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profiles: ProfileRow[]
) {
  const entries = await Promise.all(
    profiles.map(async (profile) => {
      const path = profile.avatar_image_storage_path?.trim();
      if (!path || !profile.avatar_image_version || profile.avatar_image_version <= 0) return null;
      if (!path.startsWith(`${userId}/${profile.profile_id}/`)) return null;

      const { data, error } = await supabase.storage.from("profile-avatars").createSignedUrl(path, 60 * 60);
      if (error || !data?.signedUrl) return null;
      return [profile.profile_id, data.signedUrl] as const;
    })
  );

  return Object.fromEntries(entries.filter(Boolean) as Array<readonly [string, string]>);
}
