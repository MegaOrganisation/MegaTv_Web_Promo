import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { WatchlistGrid } from "@/features/companion/watchlist/WatchlistGrid";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getWatchlistForProfile } from "@/lib/dashboard/watch-data";
import { fetchTmdbDetails, tmdbProxiedImageUrl } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export default async function CompanionWatchlistPage({
  searchParams
}: {
  searchParams: Promise<{ profile?: string; type?: string }>;
}) {
  const params = await searchParams;
  await requireUser("/companion/watchlist");
  const { isAdmin, activeProfileId } = await getDashboardData(params.profile || null);
  const profileId = activeProfileId;
  const { items } = profileId ? await getWatchlistForProfile(profileId) : { items: [] };
  const typeFilter = params.type === "movie" || params.type === "tv" ? params.type : null;
  const filtered = typeFilter ? items.filter((i) => i.mediaType === typeFilter) : items;

  const enriched = await Promise.all(
    filtered.slice(0, 60).map(async (item) => {
      const details = await fetchTmdbDetails(item.mediaType, item.tmdbId);
      return {
        ...item,
        title: details?.title || details?.name || item.title,
        posterUrl: tmdbProxiedImageUrl(item.posterPath || details?.poster_path, "w185"),
        backdropUrl: tmdbProxiedImageUrl(item.backdropPath || details?.backdrop_path, "w780"),
        genreLabel: details?.genres?.slice(0, 2).map((g) => g.name).join(" · ") || null,
        rating: details?.vote_average ?? null,
        year: (details?.release_date || details?.first_air_date || "").slice(0, 4) || null,
        runtime:
          item.mediaType === "movie"
            ? details?.runtime
              ? `${details.runtime} min`
              : null
            : details?.episode_run_time?.[0]
              ? `${details.episode_run_time[0]} min`
              : null
      };
    })
  );

  return (
    <ResponsiveShell
      title="Watchlist"
      subtitle="Synchronisée depuis MegaTv Cloud."
      isAdmin={isAdmin}
    >
      <PageEventTracker page="Companion Watchlist" />
      <div className="watchlist-page-shell">
        {!activeProfileId ? (
          <p className="mb-4 text-sm text-[var(--mega-text-muted)]">Sélectionnez un profil via le menu en haut à droite pour voir sa watchlist.</p>
        ) : null}
        {enriched.length === 0 ? (
          <p className="text-sm text-[var(--mega-text-faint)]">Watchlist vide pour ce profil.</p>
        ) : (
          <WatchlistGrid items={enriched} />
        )}
      </div>
    </ResponsiveShell>
  );
}
