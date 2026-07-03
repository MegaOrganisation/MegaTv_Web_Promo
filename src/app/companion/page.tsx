import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getWatchHistory } from "@/lib/dashboard/watch-data";
import { CompanionDashboardPage } from "@/features/dashboard/CompanionDashboardPage";

export const dynamic = "force-dynamic";

export default async function CompanionPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  await requireUser("/companion");
  const { summary, topContent, profiles, profileAvatarUrlsById, continueWatching, isAdmin, errors, activeProfile, activeProfileId } = await getDashboardData(params.profile || null);
  const { rows: watchHistory } = await getWatchHistory(activeProfileId, 200);

  return (
    <CompanionDashboardPage
      summary={summary}
      topContent={topContent}
      continueWatching={continueWatching}
      watchHistory={watchHistory}
      activeProfileId={activeProfileId}
      activeProfile={activeProfile}
      profileAvatarUrlsById={profileAvatarUrlsById}
      isAdmin={isAdmin}
      errors={errors}
    />
  );
}
