import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

export async function getAdminStatus() {
  const user = await requireUser("/companion/admin");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("megacompanion_is_admin", { uid: user.id });

  if (error) return { user, isAdmin: false, error };
  return { user, isAdmin: Boolean(data), error: null };
}

export async function requireAdmin() {
  const status = await getAdminStatus();
  if (!status.isAdmin) notFound();
  return status.user;
}
