import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  await requireUser("/companion/manage");
  const body = (await request.json().catch(() => ({}))) as { scopes?: string[] };
  const scopes = Array.isArray(body.scopes) && body.scopes.length > 0
    ? body.scopes
    : ["watchlist", "catalogs", "iptv", "settings", "addons", "devices"];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("megacompanion_request_force_sync", { p_scopes: scopes });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, pending: data });
}
