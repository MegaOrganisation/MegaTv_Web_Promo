import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { WatchlistGrid } from "@/features/companion/watchlist/WatchlistGrid";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getWatchlistForProfile } from "@/lib/dashboard/watch-data";
import { fetchTmdbDetails, tmdbImageUrl } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export default async function CompanionWatchlistPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  await requireUser("/companion/watchlist");
  const { isAdmin, activeProfileId } = await getDashboardData(params.profile || null);
  const profileId = activeProfileId;
  const { items } = profileId ? await getWatchlistForProfile(profileId) : { items: [] };

  const enriched = await Promise.all(
    items.slice(0, 60).map(async (item) => {
      const details = await fetchTmdbDetails(item.mediaType, item.tmdbId);
      return {
        ...item,
        title: details?.title || details?.name || item.title,
        posterUrl: tmdbImageUrl(item.posterPath || details?.poster_path, "w185")
      };
    })
  );

  return (
    <ResponsiveShell title="Watchlist" subtitle="Contenus à regarder plus tard, synchronisés depuis MegaTv Cloud." isAdmin={isAdmin}>
      <PageEventTracker page="Companion Watchlist" />
      <GlassCard>
        {!activeProfileId ? (
          <p className="mb-4 text-sm text-[var(--mega-text-muted)]">Sélectionnez un profil via le menu en haut à droite pour voir sa watchlist.</p>
        ) : null}
        {enriched.length === 0 ? (
          <p className="text-sm text-[var(--mega-text-faint)]">Watchlist vide pour ce profil.</p>
        ) : (
          <WatchlistGrid items={enriched} />
        )}
      </GlassCard>
    </ResponsiveShell>
  );
}
