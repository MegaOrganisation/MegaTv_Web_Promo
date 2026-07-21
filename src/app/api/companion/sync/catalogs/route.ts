import { NextResponse } from "next/server";

import { getCatalogsSlice } from "@/lib/companion/sync-queries";
import { FORCE_SYNC_ALL_SCOPES, requestForceSync } from "@/lib/companion/force-sync";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  await requireUser("/companion/manage/catalogs");
  const profileId = new URL(request.url).searchParams.get("profile")?.trim();
  if (!profileId) return NextResponse.json({ error: "profile required" }, { status: 400 });

  const slice = await getCatalogsSlice(profileId);
  return NextResponse.json(slice);
}

export async function POST(request: Request) {
  await requireUser("/companion/manage/catalogs");
  const body = (await request.json()) as {
    profileId?: string;
    catalogs?: unknown[];
    hiddenPreinstalled?: string[];
    deletedCatalogIds?: string[];
    forceSync?: boolean;
  };

  const profileId = body.profileId?.trim();
  if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("megacompanion_patch_catalogs_slice", {
    p_profile_id: profileId,
    p_catalogs: body.catalogs ?? null,
    p_hidden_preinstalled: body.hiddenPreinstalled ?? null,
    p_deleted_catalog_ids: body.deletedCatalogIds ?? null
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await requestForceSync([...FORCE_SYNC_ALL_SCOPES]);

  return NextResponse.json({ ok: true, result: data, forceSync: true });
}
