import { requireUser } from "@/lib/auth/require-user";
import { getWebProfiles } from "@/lib/web/profiles";
import { WebEntry } from "@/features/web/WebEntry";

export const dynamic = "force-dynamic";

export default async function WebEntryPage() {
  await requireUser("/web");
  const profiles = await getWebProfiles();

  return <WebEntry profiles={profiles} />;
}
