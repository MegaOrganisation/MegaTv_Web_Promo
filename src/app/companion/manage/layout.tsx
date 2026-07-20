import { Suspense, type ReactNode } from "react";

import { ManageLayoutChrome } from "@/features/companion/ManageLayoutChrome";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function ManageLayout({ children }: { children: ReactNode }) {
  await requireUser("/companion/manage");
  const { isAdmin } = await getDashboardData(null);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--mega-text-faint)]">Chargement…</div>}>
      <ManageLayoutChrome isAdmin={isAdmin} hideHero>
        {children}
      </ManageLayoutChrome>
    </Suspense>
  );
}
