import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CompanionDevicesRedirectPage({
  searchParams
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const params = await searchParams;
  const q = params.profile ? `?profile=${encodeURIComponent(params.profile)}` : "";
  redirect(`/companion/manage/devices${q}`);
}
