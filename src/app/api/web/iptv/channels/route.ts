import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { getIptvPlaylistsForProfile } from "@/lib/iptv/queries";
import { loadIptvChannels } from "@/lib/web/iptv-channels";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Channel list for `/web/tv`. Reads the profile-scoped IPTV playlists via the
 * existing slice+fallback lib (no monolithic blob), then fetches + parses the
 * M3U server-side (avoids browser CORS, keeps provider URLs server-side, caps
 * enrichment). The client caches the response in localStorage by `signature`.
 */
export async function GET(request: Request) {
  await requireUser("/web/tv");

  const profileId = new URL(request.url).searchParams.get("profile")?.trim();
  if (!profileId) {
    return NextResponse.json({ error: "profile requis" }, { status: 400 });
  }

  const { playlists, favoriteChannels, hiddenCategories, hiddenChannels, error, scope } = await getIptvPlaylistsForProfile(profileId);

  if (playlists.length === 0) {
    return NextResponse.json({
      configured: false,
      channels: [],
      categories: [],
      epgUrls: [],
      favoriteChannels,
      hiddenCategories,
      hiddenChannels,
      capped: false,
      total: 0,
      errors: error ? [{ listId: "", name: "", message: error }] : [],
      signature: "empty",
      scope
    });
  }

  const result = await loadIptvChannels(playlists);
  return NextResponse.json({
    configured: true,
    favoriteChannels,
    hiddenCategories,
    hiddenChannels,
    scope,
    ...result
  });
}
