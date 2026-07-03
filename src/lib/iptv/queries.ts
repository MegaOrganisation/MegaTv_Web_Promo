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

function asIptvMap(value: unknown): Record<string, IptvProfileState> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, IptvProfileState>;
}

function resolveProfileState(
  iptvByProfile: Record<string, IptvProfileState>,
  profileId: string,
  accountM3u?: string | null,
  accountEpg?: string | null
) {
  const direct = iptvByProfile[profileId];
  if (direct && (hasPlaylistData(direct) || direct.m3uUrl)) return direct;

  const lowered = profileId.toLowerCase();
  const match = Object.entries(iptvByProfile).find(([key]) => key.toLowerCase() === lowered);
  if (match?.[1] && (hasPlaylistData(match[1]) || match[1].m3uUrl)) return match[1];

  const withPlaylists = Object.values(iptvByProfile).find((state) => hasPlaylistData(state));
  if (withPlaylists) return withPlaylists;

  const withM3u = Object.values(iptvByProfile).find((state) => Boolean(state?.m3uUrl));
  if (withM3u) return withM3u;

  if (accountM3u) {
    return {
      m3uUrl: accountM3u,
      epgUrl: accountEpg || "",
      playlists: []
    };
  }

  return {};
}

function hasPlaylistData(state: IptvProfileState) {
  return Array.isArray(state.playlists) && state.playlists.length > 0;
}

function favoriteChannelsFromState(state: IptvProfileState): string[] {
  const raw = (state as Record<string, unknown>).favoriteChannels;
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of raw) {
    const id = typeof value === "string" ? value.trim() : String(value ?? "").trim();
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
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

function collectAccountPlaylists(iptvByProfile: Record<string, IptvProfileState>, accountM3u?: string | null, accountEpg?: string | null) {
  const merged = new Map<string, IptvPlaylistEntry>();

  Object.values(iptvByProfile).forEach((state) => {
    playlistsFromState(state).forEach((playlist) => {
      const key = `${playlist.id}|${playlist.m3uUrl}`;
      if (!merged.has(key) && playlist.m3uUrl) merged.set(key, playlist);
    });
  });

  if (merged.size === 0 && accountM3u) {
    merged.set("account_legacy", normalizePlaylistEntry({ id: "list_1", name: "Liste principale", m3uUrl: accountM3u, epgUrl: accountEpg || "", enabled: true }, 0));
  }

  return [...merged.values()];
}

export async function getIptvPlaylistsForProfile(profileId: string) {
  const supabase = await createClient();
  const normalizedProfileId = profileId.trim();

  const [sliceResult, payloadResult] = await Promise.all([
    supabase
      .from("v_account_sync_iptv")
      .select("iptv_by_profile, iptv_m3u_url, iptv_epg_url, updated_at, payload_updated_at")
      .maybeSingle(),
    supabase.from("account_sync_state").select("payload, updated_at").maybeSingle()
  ]);

  const sliceError = sliceResult.error;
  const payload = parsePayload(payloadResult.data?.payload);
  const payloadIptv = asIptvMap(payload.iptvByProfile || payload.iptv_by_profile);
  const sliceIptv = asIptvMap(sliceResult.data?.iptv_by_profile);
  const iptvByProfile = { ...payloadIptv, ...sliceIptv };

  const accountM3u =
    (sliceResult.data?.iptv_m3u_url as string | null) ||
    (typeof payload.iptvM3uUrl === "string" ? payload.iptvM3uUrl : null) ||
    (typeof payload.iptv_m3u_url === "string" ? payload.iptv_m3u_url : null);
  const accountEpg =
    (sliceResult.data?.iptv_epg_url as string | null) ||
    (typeof payload.iptvEpgUrl === "string" ? payload.iptvEpgUrl : null) ||
    (typeof payload.iptv_epg_url === "string" ? payload.iptv_epg_url : null);

  const profileState = resolveProfileState(iptvByProfile, normalizedProfileId, accountM3u, accountEpg);
  let playlists = playlistsFromState(profileState);

  if (playlists.length === 0) {
    playlists = collectAccountPlaylists(iptvByProfile, accountM3u, accountEpg);
  }

  // Favorites are strictly profile-scoped: read only the requested profile's
  // favoriteChannels (never merged across profiles). Additive field — the
  // Companion editor ignores it.
  const favoriteChannels = favoriteChannelsFromState(iptvByProfile[normalizedProfileId] || profileState);

  if (playlists.length === 0 && sliceError) {
    return {
      playlists: [] as IptvPlaylistEntry[],
      favoriteChannels,
      updatedAt: null as string | null,
      error: sliceError.message,
      scope: "empty" as const
    };
  }

  return {
    playlists,
    favoriteChannels,
    updatedAt: (sliceResult.data?.updated_at as string | null) || (payloadResult.data?.updated_at as string | null) || null,
    error: null as string | null,
    scope: playlists.length > 0 && !hasPlaylistData(profileState) && !profileState.m3uUrl ? ("account" as const) : ("profile" as const)
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

/**
 * Batch write of the ordered favorite channel ids for a profile.
 *
 * Free Tier: called ONCE on exit / debounce (never per toggle). Anti-wipe is
 * enforced server-side (RPC refuses an empty push over a non-empty cloud list),
 * so callers can pass their current local list safely.
 */
export async function saveIptvFavoritesForProfile(profileId: string, favoriteChannels: string[]) {
  const supabase = await createClient();
  const seen = new Set<string>();
  const clean = favoriteChannels
    .map((id) => (typeof id === "string" ? id.trim() : String(id ?? "").trim()))
    .filter((id) => id && !seen.has(id) && (seen.add(id), true));

  const { data, error } = await supabase.rpc("megacompanion_patch_iptv_favorites", {
    p_profile_id: profileId.trim(),
    p_favorite_channels: clean
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, data };
}
