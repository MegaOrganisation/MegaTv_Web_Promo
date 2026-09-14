import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { parseAdminAccounts, stripStoragePaths, type AdminAccount } from "@/features/admin/accounts/types";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PLAN_TIERS = new Set(["free", "pro", "trial", "lifetime"]);

type RpcProfile = {
  profile_id: string;
  avatar_id?: number | null;
  avatar_image_version?: number | null;
  avatar_image_storage_path?: string | null;
};

async function enrichAvatarUrls(accounts: AdminAccount[]): Promise<AdminAccount[]> {
  const service = createServiceClient();
  const signed = await Promise.all(
    accounts.map(async (account) => ({
      ...account,
      profiles: await Promise.all(
        (account.profiles || []).map(async (profile) => {
          const row = profile as AdminAccount["profiles"][number] & RpcProfile;
          const path = row.avatar_image_storage_path?.trim() || "";
          let avatar_url: string | null = null;
          if (
            service &&
            path &&
            (row.avatar_id || 0) === 0 &&
            (row.avatar_image_version || 0) > 0 &&
            path.startsWith(`${account.user_id}/`)
          ) {
            const { data } = await service.storage.from("profile-avatars").createSignedUrl(path, 60 * 60);
            avatar_url = data?.signedUrl || null;
          }
          return { ...profile, avatar_url };
        })
      )
    }))
  );
  return stripStoragePaths(signed);
}

async function deleteAvatarFolder(userId: string) {
  const service = createServiceClient();
  if (!service) return;
  const root = await service.storage.from("profile-avatars").list(userId, { limit: 100 });
  const paths: string[] = [];
  for (const entry of root.data || []) {
    const childPath = `${userId}/${entry.name}`;
    if (entry.id) {
      paths.push(childPath);
      continue;
    }
    const nested = await service.storage.from("profile-avatars").list(childPath, { limit: 100 });
    for (const file of nested.data || []) {
      paths.push(`${childPath}/${file.name}`);
    }
  }
  if (paths.length) await service.storage.from("profile-avatars").remove(paths);
}

export async function GET() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("megacompanion_admin_list_accounts");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const accounts = await enrichAvatarUrls(parseAdminAccounts(data));
  return NextResponse.json({ accounts, selfUserId: admin.id });
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

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  const body = (await request.json()) as { userId?: string; confirmEmail?: string };
  const userId = body.userId?.trim();
  const confirmEmail = body.confirmEmail?.trim().toLowerCase();

  if (!userId || !confirmEmail) {
    return NextResponse.json({ error: "userId et confirmEmail requis" }, { status: 400 });
  }
  if (userId === admin.id) {
    return NextResponse.json({ error: "Impossible de supprimer votre propre compte admin." }, { status: 400 });
  }

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manquant — impossible de supprimer un compte Auth." },
      { status: 503 }
    );
  }

  const { data: allowlist } = await service.from("megacompanion_admins").select("user_id").eq("user_id", userId).maybeSingle();
  if (allowlist) {
    return NextResponse.json({ error: "Impossible de supprimer un compte de l’allowlist admin." }, { status: 400 });
  }

  const { data: userData, error: getError } = await service.auth.admin.getUserById(userId);
  const target = userData?.user as User | undefined;
  if (getError || !target) {
    return NextResponse.json({ error: getError?.message || "Compte introuvable." }, { status: 404 });
  }

  const expected = (target.email || target.id).toLowerCase();
  if (confirmEmail !== expected) {
    return NextResponse.json({ error: "Confirmation e-mail / UUID incorrecte." }, { status: 400 });
  }

  await deleteAvatarFolder(userId);
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
