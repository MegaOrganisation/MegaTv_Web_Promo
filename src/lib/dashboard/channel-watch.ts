import { createClient } from "@/lib/supabase/server";
import { getIptvPlaylistsForProfile } from "@/lib/iptv/queries";
import { loadIptvChannels, type IptvChannel } from "@/lib/web/iptv-channels";

export type ChannelWatchRow = {
  channel_id: string;
  channel_name: string | null;
  logo_url: string | null;
  watch_seconds: number;
  last_watched_at: string | null;
};

/** IDs hash web (ex. 1gpu1x8) ou slugs techniques — jamais affichés tels quels. */
export function looksLikeRawId(name: string | null | undefined, id?: string): boolean {
  const n = (name || "").trim();
  if (!n) return true;
  if (id && n === id) return true;
  if (/^m3u:/i.test(n)) return true;
  if (/^[a-z0-9]{5,14}$/i.test(n) && !/\s/.test(n)) return true;
  if (/^[a-z0-9_-]+:[a-z0-9:_-]+$/i.test(n) && n.length > 20) return true;
  return false;
}

type ChannelIndex = {
  byId: Map<string, IptvChannel>;
  byTvg: Map<string, IptvChannel>;
  byName: Map<string, IptvChannel>;
};

function buildChannelIndex(channels: IptvChannel[]): ChannelIndex {
  const byId = new Map<string, IptvChannel>();
  const byTvg = new Map<string, IptvChannel>();
  const byName = new Map<string, IptvChannel>();
  for (const c of channels) {
    if (c.id) byId.set(c.id, c);
    if (c.legacyId) byId.set(c.legacyId, c);
    if (c.tvgId) byTvg.set(c.tvgId.toLowerCase().trim(), c);
    if (c.name) byName.set(c.name.toLowerCase().trim(), c);
  }
  return { byId, byTvg, byName };
}

/** Résout Android (`list_1:m3u:tvg:…`) et hash web vers une entrée M3U parsée. */
export function resolveIptvChannel(
  channelId: string,
  hintName: string | null | undefined,
  index: ChannelIndex
): IptvChannel | null {
  const id = (channelId || "").trim();
  if (!id) return null;

  const direct = index.byId.get(id);
  if (direct) return direct;

  // Strip préfixe playlist Android `list_1:…`
  const bare = id.includes(":") && !id.startsWith("m3u:") ? id.slice(id.indexOf(":") + 1) : id;
  if (bare !== id) {
    const bareHit = index.byId.get(bare);
    if (bareHit) return bareHit;
  }

  // Android buildChannelId → m3u:epgId:streamKey | m3u:streamKey
  const m3uMatch = /(?:^|:)m3u:([^:]+)(?::|$)/i.exec(id);
  if (m3uMatch?.[1]) {
    const token = m3uMatch[1].toLowerCase().trim();
    // Si 2e segment est un epg (pas un hash stream length-hex)
    if (!/^\d+-[a-f0-9]+$/i.test(token)) {
      const byTvg = index.byTvg.get(token);
      if (byTvg) return byTvg;
    }
  }

  if (hintName && !looksLikeRawId(hintName, id)) {
    const byName = index.byName.get(hintName.toLowerCase().trim());
    if (byName) return byName;
  }

  return null;
}

function displayName(rowName: string | null, id: string, ch: IptvChannel | null): string | null {
  if (ch?.name && !looksLikeRawId(ch.name, id)) return ch.name;
  if (rowName && !looksLikeRawId(rowName, id)) return rowName;
  return null;
}

/**
 * Top chaînes : uniquement `megacompanion_channel_watch` (temps réel Android + web).
 * Enrichit nom/logo via M3U. Si aucune mesure, reprend les favoris IPTV (fallback visuel).
 */
export async function getTopChannelsForProfile(
  profileId: string | null,
  limit = 8
): Promise<ChannelWatchRow[]> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user || !profileId?.trim()) return [];

  const { data, error } = await supabase
    .from("megacompanion_channel_watch")
    .select("channel_id, channel_name, logo_url, watch_seconds, last_watched_at")
    .eq("user_id", user.id)
    .eq("profile_id", profileId.trim())
    .gt("watch_seconds", 0)
    .order("watch_seconds", { ascending: false })
    .limit(Math.max(limit * 2, 16));

  const rows: ChannelWatchRow[] =
    !error && data
      ? data.map((row) => ({
          channel_id: String(row.channel_id),
          channel_name: row.channel_name ? String(row.channel_name) : null,
          logo_url: row.logo_url ? String(row.logo_url) : null,
          watch_seconds: Math.max(0, Number(row.watch_seconds) || 0),
          last_watched_at: row.last_watched_at ? String(row.last_watched_at) : null
        }))
      : [];

  try {
    const iptv = await getIptvPlaylistsForProfile(profileId.trim());
    const playlists = iptv?.playlists || [];
    const loaded = playlists.length > 0 ? await loadIptvChannels(playlists) : null;
    const index = buildChannelIndex(loaded?.channels || []);
    const favorites = iptv?.favoriteChannels || [];

    if (rows.length > 0) {
      const enriched: ChannelWatchRow[] = [];
      for (const row of rows) {
        const ch = resolveIptvChannel(row.channel_id, row.channel_name, index);
        const name = displayName(row.channel_name, row.channel_id, ch) || ch?.name || null;
        // Keep row even if name still looks technical — better than an empty chart.
        enriched.push({
          ...row,
          channel_name: name || row.channel_name || ch?.name || "Chaîne IPTV",
          logo_url: row.logo_url || ch?.logo || null
        });
      }
      return enriched.slice(0, limit);
    }

    // Fallback : favoris cloud tant que channel_watch n'est pas alimenté.
    if (favorites.length === 0 || !loaded?.channels?.length) return [];
    const byId = new Map(loaded.channels.map((c) => [c.id, c] as const));
    const byLegacy = new Map(
      loaded.channels.filter((c) => c.legacyId).map((c) => [c.legacyId, c] as const)
    );
    const fallback: ChannelWatchRow[] = [];
    favorites.forEach((id, i) => {
      const ch = byId.get(id) || byLegacy.get(id) || resolveIptvChannel(id, null, index);
      if (!ch?.name) return;
      fallback.push({
        channel_id: ch.id,
        channel_name: ch.name,
        logo_url: ch.logo,
        watch_seconds: Math.max(30, (favorites.length - i) * 30),
        last_watched_at: null
      });
    });
    return fallback.slice(0, limit);
  } catch {
    return rows
      .map((r) => ({
        ...r,
        channel_name: displayName(r.channel_name, r.channel_id, null) || r.channel_name || "Chaîne IPTV"
      }))
      .slice(0, limit);
  }
}
