import { notFound, redirect } from "next/navigation";

import { CastRail, type CastMember } from "@/features/web/details/CastRail";
import { DetailActionBar } from "@/features/web/details/DetailActions";
import { DetailHeroPremium } from "@/features/web/details/DetailHeroPremium";
import { PosterCard } from "@/features/web/PosterCard";
import { SeasonEpisodes, type SeasonInput } from "@/features/web/details/SeasonEpisodes";
import { fetchTmdbMediaFull, fetchTmdbImages, formatRuntimeMinutes, pickTitleLogo, pickTrailerKey, tmdbBackdropUrl, tmdbImageUrl } from "@/lib/tmdb";
import { decodeMediaId, encodeMediaId, type WebMediaItem } from "@/lib/web/media";

export const dynamic = "force-dynamic";

export default async function WebDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ mediaId: string }>;
  searchParams: Promise<{ profile?: string }>;
}) {
  const { mediaId } = await params;
  const { profile } = await searchParams;
  const profileId = profile?.trim();
  if (!profileId) redirect("/web");

  const ref = decodeMediaId(mediaId);
  if (!ref) notFound();

  const [details, images] = await Promise.all([
    fetchTmdbMediaFull(ref.mediaType, ref.tmdbId),
    fetchTmdbImages(ref.mediaType, ref.tmdbId)
  ]);
  if (!details) notFound();

  const title = details.title || details.name || "Contenu MegaTv";
  const logoUrl = tmdbImageUrl(pickTitleLogo(images), "w500");
  const posterUrl = tmdbImageUrl(details.poster_path, "w500");
  const backdrop = tmdbBackdropUrl(details.backdrop_path) || posterUrl;
  const runtime =
    ref.mediaType === "movie" ? formatRuntimeMinutes(details.runtime) : formatRuntimeMinutes(details.episode_run_time?.[0]);
  const year = (details.release_date || details.first_air_date || "").slice(0, 4);
  const cast = (details.credits?.cast || []).slice(0, 12).map<CastMember>((member) => ({
    id: member.id,
    name: member.name,
    character: member.character || null,
    profileUrl: tmdbImageUrl(member.profile_path, "w185")
  }));
  const seasons = (details.seasons || [])
    .filter((season) => (season.season_number ?? 0) > 0)
    .map<SeasonInput>((season) => ({
      id: season.id,
      name: season.name || `Saison ${season.season_number}`,
      seasonNumber: season.season_number ?? 0,
      episodeCount: season.episode_count || 0,
      posterUrl: tmdbImageUrl(season.poster_path, "w342")
    }));
  const trailerKey = pickTrailerKey(details);
  const similar = (details.similar?.results || [])
    .filter((item) => item.poster_path)
    .slice(0, 12)
    .map<WebMediaItem>((item) => ({
      mediaId: encodeMediaId(ref.mediaType, item.id),
      mediaType: ref.mediaType,
      tmdbId: item.id,
      title: item.title || item.name || "",
      posterUrl: tmdbImageUrl(item.poster_path, "w342"),
      backdropUrl: tmdbBackdropUrl(item.backdrop_path)
    }));

  const crew = (details.credits as { crew?: Array<{ job?: string; name?: string }> } | undefined)?.crew;
  const director = crew?.find((person) => person.job === "Director" || person.job === "Creator")?.name ?? null;

  return (
    <div className="space-y-6 pb-4 sm:space-y-8 sm:pb-0">
      <DetailHeroPremium
        profileId={profileId}
        title={title}
        backdrop={backdrop}
        posterUrl={posterUrl}
        logoUrl={logoUrl}
        year={year}
        runtime={runtime}
        rating={details.vote_average ?? null}
        mediaType={ref.mediaType}
        genres={details.genres || []}
        director={director}
      >
        <DetailActionBar
          mediaId={mediaId}
          profileId={profileId}
          title={title}
          logoUrl={logoUrl}
          trailerKey={trailerKey}
        />
      </DetailHeroPremium>

      {details.overview ? (
        <section className="max-w-3xl px-0 sm:px-1">
          <h2 className="mb-2 text-lg font-bold text-[var(--mega-text)]">Synopsis</h2>
          <p className="text-sm leading-relaxed text-[var(--mega-text-muted)] sm:text-base">{details.overview}</p>
        </section>
      ) : null}

      {ref.mediaType === "tv" && seasons.length ? (
        <SeasonEpisodes showId={ref.tmdbId} profileId={profileId} seasons={seasons} />
      ) : null}

      {cast.length ? <CastRail cast={cast} profileId={profileId} /> : null}

      {similar.length ? (
        <section className="space-y-3">
          <h2 className="px-1 text-lg font-bold text-[var(--mega-text)]">Contenus similaires</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {similar.map((item) => (
              <PosterCard key={item.mediaId} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
