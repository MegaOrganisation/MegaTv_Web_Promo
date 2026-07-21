"use client";

import type { ReactNode } from "react";

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
      subtitle="IPTV, addons, catalogues, profils et appareils — écritures batch, lectures slice."
      isAdmin={isAdmin}
      hidePageHeader={hideHero}
    >
      <ManageTabs />

      {children}
    </ResponsiveShell>
  );
}
