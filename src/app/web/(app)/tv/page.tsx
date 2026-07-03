import { redirect } from "next/navigation";

import { WebTv } from "@/features/web/tv/WebTv";

export const dynamic = "force-dynamic";

export default async function WebTvPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const profileId = (await searchParams).profile?.trim();
  if (!profileId) redirect("/web");

  return (
    <div className="space-y-6">
      <h1 className="px-1 text-2xl font-bold text-[var(--mega-text)]">TV en direct</h1>
      <WebTv profileId={profileId} />
    </div>
  );
}
