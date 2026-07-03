import { redirect } from "next/navigation";

import { CatalogRail } from "@/features/web/CatalogRail";
import { MediaRail } from "@/features/web/MediaRail";
import { WebHero } from "@/features/web/WebHero";
import { catalogsForSettingsPanel } from "@/lib/catalogs/visibility";
import { getCatalogsSlice } from "@/lib/companion/sync-queries";
import { getDashboardData } from "@/lib/dashboard/queries";
import { fetchTmdbMediaFull, pickTrailerKey } from "@/lib/tmdb";
import { continueWatchingToItem, decodeMediaId, topContentToItem, type WebMediaItem } from "@/lib/web/media";

export const dynamic = "force-dynamic";

export default async function WebHomePage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  const profileId = params.profile?.trim();
  if (!profileId) redirect("/web");

  const [dashboard, catalogsSlice] = await Promise.all([getDashboardData(profileId), getCatalogsSlice(profileId)]);

  const continueItems = dashboard.continueWatching
    .map(continueWatchingToItem)
    .filter((item): item is WebMediaItem => Boolean(item));
  const topItems = dashboard.topContent.map(topContentToItem).filter((item): item is WebMediaItem => Boolean(item));

  const hero = topItems.find((item) => item.backdropUrl) || continueItems[0] || topItems[0] || null;

  // Single cached TMDB read for the hero trailer (12h proxy revalidate) — no fan-out.
  let heroTrailerKey: string | null = null;
  if (hero) {
    const ref = decodeMediaId(hero.mediaId);
    if (ref) {
      const full = await fetchTmdbMediaFull(ref.mediaType, ref.tmdbId);
      heroTrailerKey = pickTrailerKey(full);
    }
  }

  const catalogRails = catalogsForSettingsPanel(catalogsSlice.catalogs)
    .filter((catalog) => Boolean(catalog.sourceUrl))
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {hero ? <WebHero item={hero} trailerKey={heroTrailerKey} /> : null}
      <MediaRail title="Reprendre" items={continueItems} layout="landscape" showPlay />
      <MediaRail title="Tendances pour vous" items={topItems} />
      {catalogRails.map((catalog) => (
        <CatalogRail key={catalog.id} title={catalog.title} sourceUrl={catalog.sourceUrl as string} />
      ))}
      {!hero && continueItems.length === 0 && topItems.length === 0 && catalogRails.length === 0 ? (
        <div className="mega-glass mt-10 rounded-[28px] p-10 text-center text-[var(--mega-text-muted)]">
          Aucun contenu à afficher pour ce profil. Ajoutez des catalogues depuis MegaCompagnon.
        </div>
      ) : null}
    </div>
  );
}
