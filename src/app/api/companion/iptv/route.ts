import { NextResponse } from "next/server";

import { getIptvPlaylistsForProfile, saveIptvPlaylistsForProfile } from "@/lib/iptv/queries";
import type { IptvPlaylistEntry } from "@/lib/iptv/types";
import { createClient } from "@/lib/supabase/server";

async function assertProfileOwnership(profileId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("v_megacompanion_user_profiles")
    .select("profile_id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, status: 403, error: "Profile not found" };
  }

  return { ok: true as const };
}

export async function GET(request: Request) {
  const profileId = new URL(request.url).searchParams.get("profile")?.trim();
  if (!profileId) {
    return NextResponse.json({ error: "profile query param required" }, { status: 400 });
  }

  const ownership = await assertProfileOwnership(profileId);
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const result = await getIptvPlaylistsForProfile(profileId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    profileId,
    playlists: result.playlists,
    updatedAt: result.updatedAt
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    profileId?: string;
    playlists?: IptvPlaylistEntry[];
  } | null;

  const profileId = body?.profileId?.trim();
  if (!profileId) {
    return NextResponse.json({ error: "profileId required" }, { status: 400 });
  }

  if (!Array.isArray(body?.playlists)) {
    return NextResponse.json({ error: "playlists array required" }, { status: 400 });
  }

  const ownership = await assertProfileOwnership(profileId);
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const playlists = body.playlists
    .map((entry, index) => ({
      id: String(entry.id || `list_${index + 1}`),
      name: String(entry.name || "").trim(),
      m3uUrl: String(entry.m3uUrl || "").trim(),
      epgUrl: String(entry.epgUrl || "").trim(),
      enabled: entry.enabled !== false
    }))
    .filter((entry) => entry.name && entry.m3uUrl);

  if (playlists.length === 0) {
    return NextResponse.json({ error: "At least one valid playlist required" }, { status: 400 });
  }

  const result = await saveIptvPlaylistsForProfile(profileId, playlists);
  if (!result.ok) {
    const status = result.error.includes("empty playlist") ? 409 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, ...result.data });
}
