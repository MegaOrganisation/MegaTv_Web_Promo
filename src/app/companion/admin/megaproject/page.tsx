import { AdminMegaProjectPage } from "@/features/admin/AdminMegaProjectPage";
import { requireAdmin } from "@/lib/auth/require-admin";
import { fetchMegaProjectTasks } from "@/lib/megaproject/tasks";

export const dynamic = "force-dynamic";

export default async function MegaProjectAdminRoute() {
  await requireAdmin();
  const initial = await fetchMegaProjectTasks();

  return <AdminMegaProjectPage initial={initial} />;
}
