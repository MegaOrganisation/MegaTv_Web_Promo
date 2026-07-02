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
  const days = Number(searchParams.get("days") || 30);
  const normalizedDays = days === 7 ? 7 : 30;

  const { data, error } = await supabase.rpc("megacompanion_user_activity_daily", {
    p_profile_id: profileId,
    p_days: normalizedDays
  });

  if (error) return NextResponse.json({ error: "Activity unavailable" }, { status: 500 });
  return NextResponse.json(data || []);
}
