import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { FORCE_SYNC_ALL_SCOPES, requestForceSync } from "@/lib/companion/force-sync";
import { saveIptvFavoritesForProfile } from "@/lib/iptv/queries";

export const dynamic = "force-dynamic";

/**
 * Batch cloud persistence of IPTV favorites for a profile. Called ONCE on
 * exit / debounce by the viewer (never per toggle). Anti-wipe is enforced by
 * the RPC (empty push over a non-empty cloud list is refused).
 */
export async function POST(request: Request) {
  await requireUser("/web/tv");

  let body: { profile?: string; favoriteChannels?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "corps JSON invalide" }, { status: 400 });
  }

  const profileId = body.profile?.trim();
  if (!profileId) {
    return NextResponse.json({ ok: false, error: "profile requis" }, { status: 400 });
  }

  const favorites = Array.isArray(body.favoriteChannels)
    ? body.favoriteChannels.filter((id): id is string => typeof id === "string")
    : [];

  const result = await saveIptvFavoritesForProfile(profileId, favorites);
  if (!result.ok) {
    // Anti-wipe rejection or missing migration → non-fatal for the viewer,
    // whose local (localStorage) list stays authoritative.
    return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
  }

  await requestForceSync([...FORCE_SYNC_ALL_SCOPES]);
  return NextResponse.json({ ok: true, data: result.data, forceSync: true });
}
