import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { CompanionSocialHub } from "@/features/companion/social/CompanionSocialHub";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function CompanionSocialPage({
  searchParams
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const params = await searchParams;
  await requireUser("/companion/social");
  const { isAdmin } = await getDashboardData(params.profile || null);

  return (
    <ResponsiveShell
      title="Social & Matchs"
      subtitle="Amis, matchmaking ciné et partage de films synchronisés sur tous vos appareils."
      isAdmin={isAdmin}
      hidePageHeader
    >
      <PageEventTracker page="Companion Social" />
      <CompanionSocialHub />
    </ResponsiveShell>
  );
}
