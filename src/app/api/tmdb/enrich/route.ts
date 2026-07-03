import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import {
  fetchTmdbDetails,
  fetchTmdbEpisodeWithShow,
  formatRuntimeMinutes,
  tmdbImageUrl,
  type TmdbCastMember
} from "@/lib/tmdb";

export async function GET(request: Request) {
  await requireUser("/companion");

  const { searchParams } = new URL(request.url);
  const mediaType = searchParams.get("media_type") === "tv" ? "tv" : "movie";
  const tmdbId = Number(searchParams.get("tmdb_id"));
  const season = Number(searchParams.get("season"));
  const episode = Number(searchParams.get("episode"));

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "Invalid tmdb_id" }, { status: 400 });
  }

  if (mediaType === "tv" && Number.isInteger(season) && season > 0 && Number.isInteger(episode) && episode > 0) {
    const bundle = await fetchTmdbEpisodeWithShow(tmdbId, season, episode);
    if (!bundle?.show && !bundle?.episode) {
      return NextResponse.json({ error: "TMDB unavailable" }, { status: 502 });
    }

    const cast = (bundle.show?.credits?.cast || []).slice(0, 8).map((member: TmdbCastMember) => ({
      id: member.id,
      name: member.name,
      character: member.character || null,
      photoUrl: tmdbImageUrl(member.profile_path, "w185")
    }));

    return NextResponse.json({
      id: bundle.episode?.id || bundle.show?.id || tmdbId,
      mediaType: "tv",
      title: bundle.show?.name || "Série",
      episodeTitle: bundle.episode?.name || null,
      season,
      episode,
      overview: bundle.episode?.overview || bundle.show?.overview || null,
      posterUrl: tmdbImageUrl(bundle.show?.poster_path, "w342"),
      backdropUrl: tmdbImageUrl(bundle.show?.backdrop_path || bundle.episode?.still_path, "w780"),
      runtime: formatRuntimeMinutes(bundle.episode?.runtime),
      rating: bundle.episode?.vote_average || bundle.show?.vote_average || null,
      releaseDate: bundle.episode?.air_date || bundle.show?.first_air_date || null,
      cast
    });
  }

  const details = await fetchTmdbDetails(mediaType, tmdbId);
  if (!details) return NextResponse.json({ error: "TMDB unavailable" }, { status: 502 });

  const cast = (details.credits?.cast || []).slice(0, 8).map((member) => ({
    id: member.id,
    name: member.name,
    character: member.character || null,
    photoUrl: tmdbImageUrl(member.profile_path, "w185")
  }));

  const runtime =
    mediaType === "movie"
      ? formatRuntimeMinutes(details.runtime)
      : formatRuntimeMinutes(details.episode_run_time?.[0]);

  return NextResponse.json({
    id: details.id,
    mediaType,
    title: details.title || details.name || "Contenu MegaTv",
    overview: details.overview || null,
    posterUrl: tmdbImageUrl(details.poster_path, "w342"),
    backdropUrl: tmdbImageUrl(details.backdrop_path, "w780"),
    runtime,
    rating: details.vote_average || null,
    releaseDate: details.release_date || details.first_air_date || null,
    cast
  });
}
