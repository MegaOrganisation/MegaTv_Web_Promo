import { GlassCard } from "@/components/ui/GlassCard";
import { CatalogsEditor } from "@/features/companion/catalogs/CatalogsEditor";
import { getCatalogsSlice } from "@/lib/companion/sync-queries";

export const dynamic = "force-dynamic";

export default async function ManageCatalogsPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  const profileId = params.profile?.trim();
  if (!profileId) {
    return (
      <GlassCard>
        <p className="text-sm text-white/45">Sélectionnez un profil pour gérer les catalogues.</p>
      </GlassCard>
    );
  }

  const slice = await getCatalogsSlice(profileId);

  return (
    <CatalogsEditor
      profileId={profileId}
      initialCatalogs={slice.catalogs}
      initialHiddenPreinstalled={slice.hiddenPreinstalled}
      initialDeletedIds={slice.deletedCatalogIds}
    />
  );
}
