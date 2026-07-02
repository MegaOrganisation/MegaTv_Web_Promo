"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { ManageProfileSwitcher } from "@/features/companion/ManageProfileSwitcher";
import { ManageTabs } from "@/features/companion/ManageTabs";
import type { ProfileRow } from "@/lib/supabase/types";

export function ManageLayoutChrome({
  profiles,
  profileAvatarUrlsById = {},
  children
}: {
  profiles: ProfileRow[];
  profileAvatarUrlsById?: Record<string, string>;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const activeProfileId = searchParams.get("profile")?.trim() || null;

  return (
    <ResponsiveShell
      title="Gestion cloud"
      subtitle="Addons, catalogues et IPTV par profil — écritures batch, lectures slice v_account_sync_*."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ManageProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} profileAvatarUrlsById={profileAvatarUrlsById} />
        <Link href="/companion/profiles" className="text-sm text-white/45 hover:text-white">
          ← Profils
        </Link>
      </div>
      <ManageTabs />
      {children}
    </ResponsiveShell>
  );
}
