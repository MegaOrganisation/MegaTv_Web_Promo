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

export async function getDashboardData(profileId?: string | null, options: { deviceLimit?: number; skipAvatarUrls?: boolean } = {}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const requestedProfileId = profileId?.trim() || null;
  const deviceLimit = options.deviceLimit ?? 8;

  const [profilesResult, devicesResult, adminResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, user_id, name, avatar_color, avatar_id, avatar_image_version, avatar_image_storage_path, is_kids_profile, pin, is_locked, last_used_at, updated_at, cover_type, cover_value, cover_version, cover_image_storage_path")
      .order("last_used_at", { ascending: false, nullsFirst: false }),
    supabase.from("v_megacompanion_devices").select("*").order("last_seen_at", { ascending: false, nullsFirst: false }).limit(deviceLimit),
    supabase.rpc("megacompanion_is_admin")
  ]);

  const rawProfiles = profilesResult.data && profilesResult.data.length > 0
    ? profilesResult.data
    : (await supabase.from("v_megacompanion_user_profiles").select("*").order("last_used_at", { ascending: false, nullsFirst: false })).data || [];

  const profiles = (rawProfiles as any[]).map((p) => ({
    ...p,
    profile_id: p.id || p.profile_id
  })) as ProfileRow[];

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

  const profileAvatarUrlsById = createProfileAvatarUrls(profiles);

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

export async function getAdminDashboardData(fromInput?: Date, toInput?: Date) {
  const supabase = await createClient();
  const to = toInput ?? new Date();
  const from = fromInput ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [overviewResult, topContent, pageAnalytics] = await Promise.all([
    supabase.rpc("megacompanion_admin_overview", { from_ts: from.toISOString(), to_ts: to.toISOString() }),
    supabase.rpc("megacompanion_admin_top_content", { from_ts: from.toISOString(), to_ts: to.toISOString(), p_limit: 10 }),
    supabase.rpc("megacompanion_admin_page_analytics", { from_ts: from.toISOString(), to_ts: to.toISOString() })
  ]);

  const overviewRow = Array.isArray(overviewResult.data) ? overviewResult.data[0] ?? null : overviewResult.data ?? null;

  return {
    overview: overviewRow,
    topContent: Array.isArray(topContent.data) ? topContent.data : [],
    pageAnalytics: Array.isArray(pageAnalytics.data) ? pageAnalytics.data : [],
    errors: [overviewResult.error, topContent.error, pageAnalytics.error].filter(Boolean).map((error) => error?.message || "Erreur Supabase")
  };
}

function createProfileAvatarUrls(profiles: ProfileRow[]) {
  const map: Record<string, string> = {};
  for (const profile of profiles) {
    if ((profile.avatar_image_version || 0) > 0 || profile.avatar_image_storage_path) {
      const p = profile.avatar_image_storage_path?.trim();
      if (p && (p.startsWith("http://") || p.startsWith("https://"))) {
        map[profile.profile_id] = p;
      } else {
        map[profile.profile_id] = `/api/profiles/${encodeURIComponent(profile.profile_id)}/avatar?v=${profile.avatar_image_version || 1}`;
      }
    } else if (profile.avatar_id && profile.avatar_id > 0) {
      const num = Math.min(Math.max(profile.avatar_id, 1), 20);
      map[profile.profile_id] = `/assets/avatars/avatar_${num}.png`;
    }
  }
  return map;
}
