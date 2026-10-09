import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PosterCard } from "@/features/web/PosterCard";
import { collectionCoverUrl, tileById } from "@/lib/web/collection-tiles";
import { discoverCollectionItems } from "@/lib/web/collection-discover";
import { withProfileQuery } from "@/lib/companion/profile-scope";

export const dynamic = "force-dynamic";

export default async function WebCollectionPage({
  params,
  searchParams
}: {
  params: Promise<{ collectionId: string }>;
  searchParams: Promise<{ profile?: string }>;
}) {
  const [{ collectionId: rawId }, query] = await Promise.all([params, searchParams]);
  const profileId = query.profile?.trim();
  if (!profileId) redirect("/web");

  const collectionId = decodeURIComponent(rawId || "").trim();
  const tile = tileById(collectionId);
  if (!tile) notFound();

  const items = await discoverCollectionItems(tile);
  const backHref = withProfileQuery("/web/home", profileId);

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4 px-1">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22%] border border-white/10 bg-[#1a1c1e] sm:h-24 sm:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={collectionCoverUrl(tile)} alt="" className="h-full w-full object-contain p-2" />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={backHref} className="text-xs font-semibold text-[var(--mega-text-faint)] hover:text-[var(--mega-text)]">
            ← Accueil
          </Link>
          <h1 className="mt-1 truncate text-2xl font-bold text-[var(--mega-text)]">{tile.title}</h1>
          <p className="text-xs text-[var(--mega-text-faint)]">
            {items.length ? `${items.length} titres · TMDB` : "Aucun titre pour le moment"}
          </p>
        </div>
      </div>

      {items.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {items.map((item) => (
            <PosterCard key={item.mediaId} item={item} layout="poster" fullWidth />
          ))}
        </div>
      ) : (
        <div className="mega-glass rounded-[24px] p-10 text-center text-sm text-[var(--mega-text-muted)]">
          Aucun contenu TMDB pour cette collection.
        </div>
      )}
    </div>
  );
}
