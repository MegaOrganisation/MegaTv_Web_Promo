import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { ReleasesConsole } from "@/features/admin/releases/ReleasesConsole";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminReleasesPage() {
  await requireAdmin();

  return (
    <ResponsiveShell
      title="Console OTA"
      subtitle="Manifeste version.json et statut release GitHub MegaTv_Web_Auth."
      isAdmin
      showRail={false}
      hidePageHeader
    >
      <ReleasesConsole />
    </ResponsiveShell>
  );
}
