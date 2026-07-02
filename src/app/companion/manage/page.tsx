import { redirect } from "next/navigation";

export default async function ManageIndexPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  const q = params.profile ? `?profile=${encodeURIComponent(params.profile)}` : "";
  redirect(`/companion/manage/iptv${q}`);
}
