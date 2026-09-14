import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

const PLAN_TIERS = new Set(["free", "pro", "trial", "lifetime"]);

function parseAccounts(data: unknown) {
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("megacompanion_admin_list_accounts");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ accounts: parseAccounts(data) });
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as { userId?: string; planTier?: string };
  const userId = body.userId?.trim();
  const planTier = body.planTier?.trim().toLowerCase();

  if (!userId || !planTier || !PLAN_TIERS.has(planTier)) {
    return NextResponse.json({ error: "userId et planTier (free|pro|trial|lifetime) requis" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_set_account_plan", {
    p_user_id: userId,
    p_plan_tier: planTier,
    p_product_id: null,
    p_expires_at: null
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, subscription: data });
}
