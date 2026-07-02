import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getMergedDevices } from "@/lib/devices/queries";
import { removeDuplicateDevicesFromCloud } from "@/lib/companion/sync-payload";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { duplicateIds } = await getMergedDevices({ dedupe: true });
  if (duplicateIds.length === 0) {
    return NextResponse.json({ ok: true, removed: 0 });
  }

  try {
    await removeDuplicateDevicesFromCloud(supabase, user.id, duplicateIds);
  } catch {
    return NextResponse.json({ error: "Nettoyage des doublons impossible" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, removed: duplicateIds.length });
}
