import { UserRound } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { ProfileManagementPanel } from "@/features/dashboard/ProfileManagementPanel";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function ManageProfilesPage() {
  const { profiles } = await getDashboardData(null, { skipAvatarUrls: true });

  return (
    <GlassCard as="section">
      <div className="mb-5 flex items-center gap-3">
        <div className="mega-metric-icon-wrap">
          <UserRound className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <h2 className="mega-section-title">Profils cloud</h2>
          <p className="mega-section-sub">
            Avatars MegaTv, photo personnalisée, Kids et PIN synchronisés avec l&apos;application.
          </p>
        </div>
      </div>
      <ProfileManagementPanel profiles={profiles} />
    </GlassCard>
  );
}
