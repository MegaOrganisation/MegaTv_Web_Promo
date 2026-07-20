import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { PlatformConfigConsole } from "@/features/admin/platform/PlatformConfigConsole";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminPlatformPage() {
  await requireAdmin();

  return (
    <ResponsiveShell
      title="Config plateforme"
      subtitle="Defaults addons / IPTV / catalogues pour cold-start Android."
      isAdmin
      showRail={false}
      hidePageHeader
    >
      <PlatformConfigConsole />
    </ResponsiveShell>
  );
}
