import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profile")?.trim() || null;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 5), 1), 25);
  const { data, error } = await supabase.rpc("megacompanion_user_top_content", { p_profile_id: profileId, p_limit: limit });

  if (error) return NextResponse.json({ error: "Top content unavailable" }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
