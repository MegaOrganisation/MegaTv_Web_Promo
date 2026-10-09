import { redirect } from "next/navigation";

import { CatalogRail } from "@/features/web/CatalogRail";
import { CollectionPosterRail } from "@/features/web/CollectionPosterRail";
import { FriendsRail } from "@/features/web/FriendsRail";
import { MediaRail } from "@/features/web/MediaRail";
import { WebHero } from "@/features/web/WebHero";
import { catalogsForSettingsPanel } from "@/lib/catalogs/visibility";
import { getCatalogsSlice } from "@/lib/companion/sync-queries";
import { getDashboardData } from "@/lib/dashboard/queries";
import { fetchTmdbImages, fetchTmdbMediaFull, pickTitleLogo, pickTrailerKey, tmdbImageUrl } from "@/lib/tmdb";
import { fetchFriendsRail } from "@/lib/web/friends-rail";
import { continueWatchingToItem, decodeMediaId, topContentToItem, type WebMediaItem } from "@/lib/web/media";

export const dynamic = "force-dynamic";

export default async function WebHomePage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  const profileId = params.profile?.trim();
  if (!profileId) redirect("/web");

  const [dashboard, catalogsSlice] = await Promise.all([getDashboardData(profileId), getCatalogsSlice(profileId)]);

  const activeProfile = dashboard.activeProfile;
  const isKids = Boolean(activeProfile?.is_kids_profile);
  const friendsRail = isKids
    ? []
    : await fetchFriendsRail(profileId, activeProfile?.name || null);

  const continueItems = dashboard.continueWatching
    .map(continueWatchingToItem)
    .filter((item): item is WebMediaItem => Boolean(item));
  const topItems = dashboard.topContent.map(topContentToItem).filter((item): item is WebMediaItem => Boolean(item));

  // Trending hero loop: up to 6 distinct backdrop-capable titles (movies + series).
  const heroPool = [...topItems, ...continueItems].filter((item) => item.backdropUrl);
  const seen = new Set<string>();
  const heroItems: WebMediaItem[] = [];
  for (const item of heroPool) {
    if (seen.has(item.mediaId)) continue;
    seen.add(item.mediaId);
    heroItems.push(item);
    if (heroItems.length >= 6) break;
  }
  if (heroItems.length === 0) {
    const fallback = continueItems[0] || topItems[0];
    if (fallback) heroItems.push(fallback);
  }
  const hero = heroItems[0] || null;

  // Single cached TMDB read set for the FIRST hero item only (trailer + logo) —
  // no fan-out. Remaining slides fetch their logo/trailer lazily on the client.
  let heroTrailerKey: string | null = null;
  let heroLogo: string | null = null;
  if (hero) {
    const ref = decodeMediaId(hero.mediaId);
    if (ref) {
      const [full, images] = await Promise.all([
        fetchTmdbMediaFull(ref.mediaType, ref.tmdbId),
        fetchTmdbImages(ref.mediaType, ref.tmdbId)
      ]);
      heroTrailerKey = pickTrailerKey(full);
      heroLogo = tmdbImageUrl(pickTitleLogo(images), "w500");
    }
  }

  // Media rails (MDBList / Trakt / …) — keep collection rails separate (no sourceUrl).
  const catalogRails = catalogsForSettingsPanel(catalogsSlice.catalogs)
    .filter((catalog) => Boolean(catalog.sourceUrl) && catalog.kind !== "COLLECTION_RAIL")
    .slice(0, 10);

  // Insert Services / Genres / Studios after the first two media rails (Android Home order).
  const headRails = catalogRails.slice(0, 2);
  const tailRails = catalogRails.slice(2);

  return (
    <div className="space-y-6 sm:space-y-8">
      {heroItems.length ? <WebHero items={heroItems} initialTrailerKey={heroTrailerKey} initialLogo={heroLogo} /> : null}
      <MediaRail title="Reprendre" items={continueItems} layout="landscape" variant="continue" />
      {!isKids && friendsRail.length > 0 ? <FriendsRail friends={friendsRail} /> : null}
      {headRails.map((catalog) => (
        <CatalogRail
          key={catalog.id}
          catalogId={catalog.id}
          title={catalog.title}
          sourceUrl={catalog.sourceUrl as string}
        />
      ))}
      <CollectionPosterRail group="SERVICE" />
      <CollectionPosterRail group="GENRE" />
      <CollectionPosterRail group="FRANCHISE" />
      {tailRails.map((catalog) => (
        <CatalogRail
          key={catalog.id}
          catalogId={catalog.id}
          title={catalog.title}
          sourceUrl={catalog.sourceUrl as string}
        />
      ))}
      {!hero && continueItems.length === 0 && topItems.length === 0 && catalogRails.length === 0 ? (
        <div className="mega-glass mt-10 rounded-[28px] p-10 text-center text-[var(--mega-text-muted)]">
          Aucun contenu à afficher pour ce profil. Ajoutez des catalogues depuis MegaCompagnon.
        </div>
      ) : null}
    </div>
  );
}
