import { NextResponse } from "next/server";

import { FORCE_SYNC_ALL_SCOPES, requestForceSync } from "@/lib/companion/force-sync";
import { saveIptvHiddenCategoriesForProfile } from "@/lib/iptv/queries";
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    profileId?: string;
    hiddenCategories?: unknown;
  } | null;

  const profileId = body?.profileId?.trim();
  if (!profileId) {
    return NextResponse.json({ error: "profileId required" }, { status: 400 });
  }

  if (!Array.isArray(body?.hiddenCategories)) {
    return NextResponse.json({ error: "hiddenCategories array required" }, { status: 400 });
  }

  const ownership = await assertProfileOwnership(profileId);
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const hiddenCategories = body.hiddenCategories
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);

  const result = await saveIptvHiddenCategoriesForProfile(profileId, hiddenCategories);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  await requestForceSync([...FORCE_SYNC_ALL_SCOPES]);
  return NextResponse.json({ ok: true, ...result.data, forceSync: true });
}
