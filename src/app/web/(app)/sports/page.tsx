import { redirect } from "next/navigation";
import { WebSports } from "@/features/web/sports/WebSports";

export const dynamic = "force-dynamic";

export default async function WebSportsPage({
  searchParams
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const params = await searchParams;
  const profileId = params.profile?.trim();
  if (!profileId) redirect("/web");

  return <WebSports profileId={profileId} />;
}
