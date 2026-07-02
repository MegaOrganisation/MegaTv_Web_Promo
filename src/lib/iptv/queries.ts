import { createClient } from "@/lib/supabase/server";
import { normalizePlaylistEntry, type IptvPlaylistEntry, type IptvProfileState } from "@/lib/iptv/types";

function parsePayload(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function resolveProfileState(iptvByProfile: Record<string, IptvProfileState>, profileId: string) {
  const direct = iptvByProfile[profileId];
  if (direct) return direct;

  const lowered = profileId.toLowerCase();
  const match = Object.entries(iptvByProfile).find(([key]) => key.toLowerCase() === lowered);
  if (match) return match[1];

  const withPlaylists = Object.values(iptvByProfile).find((state) => Array.isArray(state?.playlists) && state.playlists.length > 0);
  if (withPlaylists) return withPlaylists;

  return Object.values(iptvByProfile).find((state) => Boolean(state?.m3uUrl)) || {};
}

function playlistsFromState(profileState: IptvProfileState) {
  const rawPlaylists = Array.isArray(profileState.playlists) ? profileState.playlists : [];
  const playlists = rawPlaylists.map((entry, index) => normalizePlaylistEntry(entry as Record<string, unknown>, index));

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

  return playlists;
}

export async function getIptvPlaylistsForProfile(profileId: string) {
  const supabase = await createClient();
  const normalizedProfileId = profileId.trim();

  const [sliceResult, payloadResult] = await Promise.all([
    supabase.from("v_account_sync_iptv").select("iptv_by_profile, updated_at, payload_updated_at").maybeSingle(),
    supabase.from("account_sync_state").select("payload, updated_at").maybeSingle()
  ]);

  const sliceError = sliceResult.error;
  const payload = parsePayload(payloadResult.data?.payload);
  const payloadIptv = (payload.iptvByProfile || payload.iptv_by_profile || {}) as Record<string, IptvProfileState>;
  const sliceIptv = (sliceResult.data?.iptv_by_profile || {}) as Record<string, IptvProfileState>;
  const iptvByProfile = { ...payloadIptv, ...sliceIptv };
  const profileState = resolveProfileState(iptvByProfile, normalizedProfileId);
  const playlists = playlistsFromState(profileState);

  if (playlists.length === 0 && sliceError) {
    return { playlists: [] as IptvPlaylistEntry[], updatedAt: null as string | null, error: sliceError.message };
  }

  return {
    playlists,
    updatedAt: (sliceResult.data?.updated_at as string | null) || (payloadResult.data?.updated_at as string | null) || null,
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
