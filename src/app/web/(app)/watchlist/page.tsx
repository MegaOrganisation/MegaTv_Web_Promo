import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";

import { PosterCard } from "@/features/web/PosterCard";
import { getWatchlistForProfile } from "@/lib/dashboard/watch-data";
import { tmdbBackdropUrl, tmdbImageUrl } from "@/lib/tmdb";
import { encodeMediaId, type WebMediaItem } from "@/lib/web/media";

export const dynamic = "force-dynamic";

export default async function WebWatchlistPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const profileId = (await searchParams).profile?.trim();
  if (!profileId) redirect("/web");

  // Profile-scoped slice read (v_account_sync_watchlist) — no monolithic blob.
  const { items } = await getWatchlistForProfile(profileId);
  const media = items.map<WebMediaItem>((item) => ({
    mediaId: encodeMediaId(item.mediaType, item.tmdbId),
    mediaType: item.mediaType,
    tmdbId: item.tmdbId,
    title: item.title,
    subtitle: null,
    posterUrl: tmdbImageUrl(item.posterPath, "w342"),
    backdropUrl: tmdbBackdropUrl(item.backdropPath)
  }));

  return (
    <div className="space-y-6">
      <h1 className="px-1 text-2xl font-bold text-[var(--mega-text)]">Ma liste</h1>

      {media.length === 0 ? (
        <div className="mega-glass mx-auto mt-6 flex max-w-lg flex-col items-center gap-4 rounded-[28px] p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--mega-card-bg)] text-[var(--mega-text)]">
            <Bookmark className="h-7 w-7" />
          </span>
          <p className="text-sm text-[var(--mega-text-muted)]">
            Votre liste de surveillance est vide. Ajoutez des titres depuis l&apos;app MegaTv ou MegaCompagnon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {media.map((item) => (
            <PosterCard key={item.mediaId} item={item} fullWidth showPlay />
          ))}
        </div>
      )}
    </div>
  );
}
