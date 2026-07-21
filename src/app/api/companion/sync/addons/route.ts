import { NextResponse } from "next/server";

import { getAddonsSlice } from "@/lib/companion/sync-queries";
import { FORCE_SYNC_ALL_SCOPES, requestForceSync } from "@/lib/companion/force-sync";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  await requireUser("/companion/manage/addons");
  const profileId = new URL(request.url).searchParams.get("profile")?.trim();
  if (!profileId) return NextResponse.json({ error: "profile required" }, { status: 400 });

  const slice = await getAddonsSlice(profileId);
  return NextResponse.json(slice);
}

export async function POST(request: Request) {
  await requireUser("/companion/manage/addons");
  const body = (await request.json()) as {
    profileId?: string;
    addons?: unknown[];
    hiddenBuiltIn?: string[];
    forceSync?: boolean;
  };

  const profileId = body.profileId?.trim();
  if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("megacompanion_patch_addons_slice", {
    p_profile_id: profileId,
    p_addons: body.addons ?? null,
    p_hidden_built_in: body.hiddenBuiltIn ?? null
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await requestForceSync([...FORCE_SYNC_ALL_SCOPES]);

  return NextResponse.json({ ok: true, result: data, forceSync: true });
}
