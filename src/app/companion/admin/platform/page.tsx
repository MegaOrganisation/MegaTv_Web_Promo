import { PlatformConfigConsole } from "@/features/admin/platform/PlatformConfigConsole";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminPlatformPage() {
  await requireAdmin();
  return <PlatformConfigConsole />;
}
