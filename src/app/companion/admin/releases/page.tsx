import { ReleasesConsole } from "@/features/admin/releases/ReleasesConsole";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminReleasesPage() {
  await requireAdmin();
  return <ReleasesConsole />;
}
