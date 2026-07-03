import { Suspense, type ReactNode } from "react";

import { ManageLayoutChrome } from "@/features/companion/ManageLayoutChrome";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function ManageLayout({ children }: { children: ReactNode }) {
  await requireUser("/companion/manage");

  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--mega-text-faint)]">Chargement…</div>}>
      <ManageLayoutChrome>{children}</ManageLayoutChrome>
    </Suspense>
  );
}
