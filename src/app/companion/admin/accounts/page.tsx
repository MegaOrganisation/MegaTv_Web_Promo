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
      title="Gestion utilisateurs"
      subtitle="Comptes MegaTv, photos de profil, codes ami et suppression cloud."
      isAdmin
      showRail={false}
      hidePageHeader
      hero={<CinemaHero title="Gestion utilisateurs" subtitle="Photos, plans Pro, codes ami — allowlist admin." badge="Admin" />}
    >
      <PageEventTracker page="Companion Admin Accounts" />
      <AdminAccountsConsole />
    </ResponsiveShell>
  );
}
