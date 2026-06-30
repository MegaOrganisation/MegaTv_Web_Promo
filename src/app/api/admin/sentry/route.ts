import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { fetchSentrySummary } from "@/lib/sentry-admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: isAdmin, error } = await supabase.rpc("megacompanion_is_admin", { uid: user.id });
  if (error || !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const summary = await fetchSentrySummary();
  return NextResponse.json(summary);
}
