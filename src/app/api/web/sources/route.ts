import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { getAddonsSlice } from "@/lib/companion/sync-queries";
import { getIptvPlaylistsForProfile } from "@/lib/iptv/queries";
import { fetchTmdbDetails } from "@/lib/tmdb";
import { decodeMediaId } from "@/lib/web/media";
import { resolveStreamSources } from "@/lib/web/stream-resolver";

export const dynamic = "force-dynamic";

export type WebSource = {
  url: string;
  groupId: string;
  groupLabel: string;
  title: string;
  quality: string;
  detail: string | null;
  label: string;
  type: "hls" | "mp4";
};

/**
 * Lazy playback source list for the details SourcePicker. IPTV VOD playlists +
 * Stremio addons, grouped like the mobile Sources sheet.
 */
export async function GET(request: Request) {
  await requireUser("/web");

  const params = new URL(request.url).searchParams;
  const mediaId = params.get("mediaId")?.trim() || "";
  const profileId = params.get("profile")?.trim() || "";
  const ref = decodeMediaId(mediaId);
  if (!ref || !profileId) {
    return NextResponse.json({ error: "mediaId / profile requis" }, { status: 400 });
  }

  const [addonsSlice, iptv, details] = await Promise.all([
    getAddonsSlice(profileId),
    getIptvPlaylistsForProfile(profileId),
    fetchTmdbDetails(ref.mediaType, ref.tmdbId)
  ]);

  const title = details?.title || details?.name || "";
  const year = Number((details?.release_date || details?.first_air_date || "").slice(0, 4)) || null;

  const resolution = await resolveStreamSources(
    {
      mediaType: ref.mediaType,
      tmdbId: ref.tmdbId,
      season: ref.season,
      episode: ref.episode
    },
    addonsSlice.addons,
    { iptvPlaylists: iptv.playlists, title, year }
  );

  const sources = resolution.sources.map<WebSource>((source) => ({
    url: source.url,
    groupId: source.groupId || source.addonId || source.groupLabel || "addon",
    groupLabel: source.groupLabel || source.provider || "Addon",
    title: source.title || source.label,
    quality: source.quality || "",
    detail: source.detail || null,
    label: source.label,
    type: source.type
  }));

  return NextResponse.json({ sources, reason: resolution.reason });
}
