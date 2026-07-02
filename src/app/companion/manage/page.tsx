import { redirect } from "next/navigation";

import { getDashboardData } from "@/lib/dashboard/queries";

export default async function ManageIndexPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  const profileId = params.profile?.trim();
  if (profileId) {
    redirect(`/companion/manage/iptv?profile=${encodeURIComponent(profileId)}`);
  }
  const { profiles } = await getDashboardData(null);
  if (profiles[0]?.profile_id) {
    redirect(`/companion/manage/iptv?profile=${encodeURIComponent(profiles[0].profile_id)}`);
  }
  redirect("/companion/manage/iptv");
}
