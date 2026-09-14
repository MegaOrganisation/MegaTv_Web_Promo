import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { AdminAccountsConsole } from "@/features/admin/accounts/AdminAccountsConsole";
import { CinemaHero } from "@/features/companion/ui/CinemaHero";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  await requireAdmin();

  return (
    <ResponsiveShell
      title="Comptes"
      subtitle="Liste des comptes MegaTv, plans Pro et codes ami par profil."
      isAdmin
      showRail={false}
      hero={<CinemaHero title="Comptes" subtitle="Allowlist admin — Pro, profils et codes ami." badge="Admin" />}
    >
      <PageEventTracker page="Companion Admin Accounts" />
      <AdminAccountsConsole />
    </ResponsiveShell>
  );
}
