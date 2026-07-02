import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  await requireAdmin();
  const scope = new URL(request.url).searchParams.get("scope")?.trim() || null;
  const supabase = await createClient();

  let query = supabase
    .from("platform_config_revisions")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(20);

  if (scope) query = query.eq("scope", scope);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ revisions: data || [] });
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as {
    scope?: string;
    payload?: Record<string, unknown>;
    mandatoryOnBoot?: boolean;
  };

  if (!body.scope || !body.payload) {
    return NextResponse.json({ error: "scope et payload requis" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("megacompanion_admin_publish_config", {
    p_scope: body.scope,
    p_payload: body.payload,
    p_mandatory_on_boot: Boolean(body.mandatoryOnBoot)
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, revision: data });
}
