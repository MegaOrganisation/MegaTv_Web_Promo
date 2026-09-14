import { AdminAccountsConsole } from "@/features/admin/accounts/AdminAccountsConsole";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  await requireAdmin();

  return (
    <>
      <PageEventTracker page="Companion Admin Accounts" />
      <AdminAccountsConsole />
    </>
  );
}
