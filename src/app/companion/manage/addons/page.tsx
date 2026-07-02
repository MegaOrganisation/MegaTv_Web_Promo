import { GlassCard } from "@/components/ui/GlassCard";
import { AddonsEditor } from "@/features/companion/addons/AddonsEditor";
import { getAddonsSlice } from "@/lib/companion/sync-queries";

export const dynamic = "force-dynamic";

export default async function ManageAddonsPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  const profileId = params.profile?.trim();
  if (!profileId) {
    return (
      <GlassCard>
        <p className="text-sm text-white/45">Sélectionnez un profil pour gérer les addons.</p>
      </GlassCard>
    );
  }

  const slice = await getAddonsSlice(profileId);

  return (
    <AddonsEditor profileId={profileId} initialAddons={slice.addons} initialHiddenBuiltIn={slice.hiddenBuiltIn} />
  );
}
