import { UserRound } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { ProfileManagementPanel } from "@/features/dashboard/ProfileManagementPanel";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function CompanionProfilesPage() {
  await requireUser("/companion/profiles");
  const { profiles, profileAvatarUrlsById, isAdmin } = await getDashboardData(null);

  return (
    <ResponsiveShell title="Profils" subtitle="Gérez les profils MegaTv : avatars, mode Kids et code PIN." isAdmin={isAdmin}>
      <PageEventTracker page="Companion Profiles" />
      <GlassCard as="section">
        <div className="mb-5 flex items-center gap-3">
          <UserRound className="h-6 w-6 text-white/70" />
          <div>
            <h2 className="text-2xl font-bold text-white">Profils cloud</h2>
            <p className="mt-1 text-sm text-white/45">Avatars MegaTv, photo personnalisée, Kids et PIN synchronisés avec l&apos;application.</p>
          </div>
        </div>
        <ProfileManagementPanel profiles={profiles} profileAvatarUrlsById={profileAvatarUrlsById} />
      </GlassCard>
    </ResponsiveShell>
  );
}
