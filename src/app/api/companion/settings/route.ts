import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("sync_pull_profile_settings_blob", {
      p_profile_id: profileId,
      p_platform: "web"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const firstRow = Array.isArray(data) ? data[0] : null;
    const settings = firstRow?.settings_json || {};

    return NextResponse.json({ profileId, settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.profileId || !body.settings) {
      return NextResponse.json({ error: "Invalid body: profileId and settings required" }, { status: 400 });
    }

    const { error } = await supabase.rpc("sync_push_profile_settings_blob", {
      p_profile_id: body.profileId,
      p_settings_json: body.settings,
      p_platform: "web",
      p_origin_client_id: "megacompanion-web"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profileId: body.profileId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
