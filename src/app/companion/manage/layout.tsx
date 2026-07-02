import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { ManageProfileSwitcher } from "@/features/companion/ManageProfileSwitcher";
import { ManageTabs } from "@/features/companion/ManageTabs";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

function profileHref(path: string, profileId?: string | null) {
  if (!profileId) return path;
  return `${path}?profile=${encodeURIComponent(profileId)}`;
}

export default async function ManageLayout({
  children,
  searchParams
}: {
  children: ReactNode;
  searchParams: Promise<{ profile?: string }>;
}) {
  const params = await searchParams;
  await requireUser("/companion/manage");
  const activeProfileId = params.profile?.trim() || null;
  const { profiles } = await getDashboardData(activeProfileId);

  if (!activeProfileId && profiles[0]?.profile_id) {
    redirect(profileHref("/companion/manage/iptv", profiles[0].profile_id));
  }

  return (
    <ResponsiveShell
      title="Gestion cloud"
      subtitle="Addons, catalogues et IPTV par profil — écritures batch, lectures slice v_account_sync_*."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ManageProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} />
        <Link href="/companion/settings" className="text-sm text-white/45 hover:text-white">
          ← Retour réglages
        </Link>
      </div>
      <ManageTabs />
      {children}
    </ResponsiveShell>
  );
}
