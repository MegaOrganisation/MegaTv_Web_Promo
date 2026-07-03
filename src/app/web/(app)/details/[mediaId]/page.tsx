import { notFound, redirect } from "next/navigation";
import { Star } from "lucide-react";

import { CastRail, type CastMember } from "@/features/web/details/CastRail";
import { DetailActionBar, DetailBackButton } from "@/features/web/details/DetailActions";
import { PosterCard } from "@/features/web/PosterCard";
import { SeasonEpisodes, type SeasonInput } from "@/features/web/details/SeasonEpisodes";
import { fetchTmdbMediaFull, fetchTmdbImages, formatRuntimeMinutes, pickTitleLogo, pickTrailerKey, tmdbImageUrl } from "@/lib/tmdb";
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
  const backdrop = tmdbImageUrl(details.backdrop_path, "w780") || tmdbImageUrl(details.poster_path, "w500");
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
      backdropUrl: tmdbImageUrl(item.backdrop_path, "w780")
    }));

  return (
    <div className="space-y-8">
      <section className="relative -mx-4 overflow-hidden sm:-mx-6 lg:mx-0 lg:border lg:border-[var(--mega-border)] mega-poster-radius">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          {backdrop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backdrop} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[var(--mega-surface)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--mega-background-deep)_2%,rgba(6,7,10,0.35)_60%,transparent_100%)]" />
          <DetailBackButton profileId={profileId} />
        </div>
        <div className="relative -mt-24 flex flex-col gap-4 px-4 sm:-mt-28 sm:px-8">
          <h1 className="text-3xl font-black text-[var(--mega-text)] sm:text-5xl">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--mega-text-muted)]">
            {year ? <span>{year}</span> : null}
            {runtime ? <span>· {runtime}</span> : null}
            {details.vote_average ? (
              <span className="inline-flex items-center gap-1">
                · <Star className="h-4 w-4 text-[var(--mega-yellow)]" fill="currentColor" /> {details.vote_average.toFixed(1)}
              </span>
            ) : null}
            <span className="rounded-full border border-[var(--mega-border)] px-2 py-0.5 text-xs uppercase tracking-wide">
              {ref.mediaType === "tv" ? "Série" : "Film"}
            </span>
          </div>
          {(details.genres || []).length ? (
            <div className="flex flex-wrap gap-2">
              {(details.genres || []).map((genre) => (
                <span key={genre.id} className="rounded-full bg-[var(--mega-card-bg)] px-3 py-1 text-xs text-[var(--mega-text-muted)]">
                  {genre.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-1">
        <DetailActionBar mediaId={mediaId} profileId={profileId} title={title} logoUrl={logoUrl} trailerKey={trailerKey} />
      </section>

      {details.overview ? (
        <section className="max-w-3xl px-1">
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
