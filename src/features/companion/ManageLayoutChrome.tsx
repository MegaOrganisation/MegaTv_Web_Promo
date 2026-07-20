"use client";

import type { ReactNode } from "react";

import { MegaLink } from "@/components/ui/MegaButton";
import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { ManageTabs } from "@/features/companion/ManageTabs";

export function ManageLayoutChrome({
  children,
  isAdmin = false,
  hideHero = true
}: {
  children: ReactNode;
  isAdmin?: boolean;
  hideHero?: boolean;
}) {
  return (
    <ResponsiveShell
      title="Gestion cloud"
      subtitle="Addons, catalogues et IPTV par profil — écritures batch, lectures slice."
      isAdmin={isAdmin}
      hidePageHeader={hideHero}
    >
      <div className="mb-4 flex justify-end">
        <nav className="mega-pill-nav" aria-label="Actions profils">
          <MegaLink href="/companion/profiles" variant="ghost">
            Gérer les profils →
          </MegaLink>
        </nav>
      </div>

      <ManageTabs />

      {children}
    </ResponsiveShell>
  );
}
