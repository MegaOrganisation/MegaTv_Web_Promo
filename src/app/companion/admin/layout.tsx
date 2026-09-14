import { Suspense, type ReactNode } from "react";

import { AdminLayoutChrome } from "@/features/admin/AdminLayoutChrome";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--mega-text-faint)]">Chargement…</div>}>
      <AdminLayoutChrome>{children}</AdminLayoutChrome>
    </Suspense>
  );
}
