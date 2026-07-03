import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { getIptvPlaylistsForProfile } from "@/lib/iptv/queries";
import { loadIptvChannels } from "@/lib/web/iptv-channels";
import { loadEpgNowNext, type EpgMap } from "@/lib/web/iptv-epg";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Simplified now/next EPG for `/web/tv`. The EPG URLs are derived SERVER-SIDE
 * from the profile's playlists (never trusted from the client → no open fetch
 * proxy / SSRF), fetched + parsed once and cached in-process. Best-effort:
 * returns `{}` if no EPG is configured or parsing fails.
 */
export async function GET(request: Request) {
  await requireUser("/web/tv");

  const profileId = new URL(request.url).searchParams.get("profile")?.trim();
  if (!profileId) {
    return NextResponse.json({ error: "profile requis" }, { status: 400 });
  }

  const { playlists } = await getIptvPlaylistsForProfile(profileId);
  if (playlists.length === 0) return NextResponse.json({ epg: {} as EpgMap });

  const { epgUrls } = await loadIptvChannels(playlists); // cached parse
  if (epgUrls.length === 0) return NextResponse.json({ epg: {} as EpgMap });

  const maps = await Promise.all(epgUrls.slice(0, 3).map((url) => loadEpgNowNext(url)));
  const merged: EpgMap = Object.assign({}, ...maps);
  return NextResponse.json({ epg: merged });
}
