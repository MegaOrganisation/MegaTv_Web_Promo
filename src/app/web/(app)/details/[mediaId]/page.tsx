import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Play, Star } from "lucide-react";

import { PosterCard } from "@/features/web/PosterCard";
import { withProfileQuery } from "@/lib/companion/profile-scope";
import { fetchTmdbMediaFull, formatRuntimeMinutes, tmdbImageUrl } from "@/lib/tmdb";
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

  const details = await fetchTmdbMediaFull(ref.mediaType, ref.tmdbId);
  if (!details) notFound();

  const title = details.title || details.name || "Contenu MegaTv";
  const backdrop = tmdbImageUrl(details.backdrop_path, "w780") || tmdbImageUrl(details.poster_path, "w500");
  const runtime =
    ref.mediaType === "movie" ? formatRuntimeMinutes(details.runtime) : formatRuntimeMinutes(details.episode_run_time?.[0]);
  const year = (details.release_date || details.first_air_date || "").slice(0, 4);
  const cast = (details.credits?.cast || []).slice(0, 12);
  const seasons = (details.seasons || []).filter((season) => (season.season_number ?? 0) > 0);
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

  const playHref = withProfileQuery(`/web/player/${mediaId}`, profileId);

  return (
    <div className="space-y-10">
      <section className="relative -mx-4 overflow-hidden sm:-mx-6 lg:mx-0 lg:rounded-[28px] lg:border lg:border-[var(--mega-border)]">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          {backdrop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backdrop} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[var(--mega-surface)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--mega-background-deep)_2%,rgba(6,7,10,0.35)_60%,transparent_100%)]" />
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
          <div>
            <Link
              href={playHref}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--mega-text)] px-7 py-3 text-sm font-bold text-[var(--mega-background-deep)] transition hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Lire
            </Link>
          </div>
        </div>
      </section>

      {details.overview ? (
        <section className="max-w-3xl px-1">
          <h2 className="mb-2 text-lg font-bold text-[var(--mega-text)]">Synopsis</h2>
          <p className="text-sm leading-relaxed text-[var(--mega-text-muted)] sm:text-base">{details.overview}</p>
        </section>
      ) : null}

      {seasons.length ? (
        <section className="space-y-3 px-1">
          <h2 className="text-lg font-bold text-[var(--mega-text)]">Saisons ({seasons.length})</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {seasons.map((season) => (
              <div key={season.id} className="w-[130px] shrink-0 sm:w-[150px]">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-surface)]">
                  {tmdbImageUrl(season.poster_path, "w342") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tmdbImageUrl(season.poster_path, "w342") as string} alt={season.name || ""} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-medium text-[var(--mega-text-muted)]">{season.name}</p>
                <p className="text-[10px] text-[var(--mega-text-faint)]">{season.episode_count || 0} épisodes</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {cast.length ? (
        <section className="space-y-3 px-1">
          <h2 className="text-lg font-bold text-[var(--mega-text)]">Casting</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {cast.map((member) => (
              <div key={member.id} className="w-[92px] shrink-0 text-center">
                <div className="relative mx-auto h-[92px] w-[92px] overflow-hidden rounded-full border border-[var(--mega-border)] bg-[var(--mega-surface)]">
                  {tmdbImageUrl(member.profile_path, "w185") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tmdbImageUrl(member.profile_path, "w185") as string} alt={member.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-semibold text-[var(--mega-text)]">{member.name}</p>
                {member.character ? <p className="line-clamp-1 text-[10px] text-[var(--mega-text-faint)]">{member.character}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

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
