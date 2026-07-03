"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { ManageTabs } from "@/features/companion/ManageTabs";

export function ManageLayoutChrome({ children }: { children: ReactNode }) {
  return (
    <ResponsiveShell
      title="Gestion cloud"
      subtitle="Addons, catalogues et IPTV par profil — écritures batch, lectures slice v_account_sync_*."
    >
      <div className="mb-4 flex justify-end">
        <Link href="/companion/profiles" className="text-sm text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]">
          Gérer les profils →
        </Link>
      </div>
      <ManageTabs />
      {children}
    </ResponsiveShell>
  );
}
