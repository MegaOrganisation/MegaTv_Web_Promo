import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { CompanionCalendarClient } from "@/features/companion/calendar/CompanionCalendarClient";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getWatchHistory } from "@/lib/dashboard/watch-data";
import { fetchTmdbUpcomingCalendar } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export default async function CompanionCalendarPage({
  searchParams
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const params = await searchParams;
  await requireUser("/companion/calendar");
  const { isAdmin, activeProfileId } = await getDashboardData(params.profile || null);
  const [{ rows }, releases] = await Promise.all([
    getWatchHistory(activeProfileId, 400),
    fetchTmdbUpcomingCalendar(80)
  ]);

  return (
    <ResponsiveShell
      title="Calendrier"
      subtitle="Visionnages passés et sorties film/série à venir (catalogue TMDB)."
      isAdmin={isAdmin}
      showRail={false}
    >
      <PageEventTracker page="companion_calendar" />
      <div className="companion-calendar-page flex min-h-0 flex-1 flex-col">
        <CompanionCalendarClient rows={rows} releases={releases} />
      </div>
    </ResponsiveShell>
  );
}
