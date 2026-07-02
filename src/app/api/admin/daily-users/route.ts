import { NextResponse } from "next/server";

import { parseAdminPeriod, periodRange } from "@/lib/admin/period";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  await requireAdmin();
  const days = parseAdminPeriod(new URL(request.url).searchParams.get("days"));
  const { from, to } = periodRange(days);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("megacompanion_admin_daily_active_users", {
    from_ts: from.toISOString(),
    to_ts: to.toISOString()
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ days, series: data || [] });
}
