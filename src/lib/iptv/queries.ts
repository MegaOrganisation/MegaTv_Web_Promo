import { createClient } from "@/lib/supabase/server";
import { normalizePlaylistEntry, type IptvPlaylistEntry, type IptvProfileState } from "@/lib/iptv/types";

export async function getIptvPlaylistsForProfile(profileId: string) {
  const supabase = await createClient();
  const normalizedProfileId = profileId.trim();

  const { data, error } = await supabase
    .from("v_account_sync_iptv")
    .select("iptv_by_profile, updated_at, payload_updated_at")
    .maybeSingle();

  if (error) {
    return { playlists: [] as IptvPlaylistEntry[], updatedAt: null as string | null, error: error.message };
  }

  const iptvByProfile = (data?.iptv_by_profile || {}) as Record<string, IptvProfileState>;
  const profileState = iptvByProfile[normalizedProfileId] || {};
  const rawPlaylists = Array.isArray(profileState.playlists) ? profileState.playlists : [];

  const playlists = rawPlaylists.map((entry, index) =>
    normalizePlaylistEntry(entry as Record<string, unknown>, index)
  );

  if (playlists.length === 0 && profileState.m3uUrl) {
    playlists.push(
      normalizePlaylistEntry(
        {
          id: "list_1",
          name: "Liste principale",
          m3uUrl: profileState.m3uUrl,
          epgUrl: profileState.epgUrl || "",
          enabled: true
        },
        0
      )
    );
  }

  return {
    playlists,
    updatedAt: (data?.updated_at as string | null) || null,
    error: null as string | null
  };
}

export async function saveIptvPlaylistsForProfile(profileId: string, playlists: IptvPlaylistEntry[]) {
  const supabase = await createClient();
  const payload = playlists.map((entry) => ({
    id: entry.id,
    name: entry.name,
    m3uUrl: entry.m3uUrl,
    epgUrl: entry.epgUrl || "",
    enabled: entry.enabled !== false
  }));

  const { data, error } = await supabase.rpc("megacompanion_patch_iptv_playlists", {
    p_profile_id: profileId.trim(),
    p_playlists: payload
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, data };
}
