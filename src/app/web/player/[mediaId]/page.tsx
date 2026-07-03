import { notFound, redirect } from "next/navigation";

import { WebPlayerExperience } from "@/features/web/player/WebPlayerExperience";
import type { PlayerSubtitle } from "@/features/web/WebPlayer";
import { getAddonsSlice } from "@/lib/companion/sync-queries";
import { getIptvPlaylistsForProfile } from "@/lib/iptv/queries";
import { withProfileQuery } from "@/lib/companion/profile-scope";
import { fetchTmdbDetails } from "@/lib/tmdb";
import { resolveAddonSubtitles } from "@/lib/web/addon-streams";
import { decodeMediaId } from "@/lib/web/media";
import { subtitleProxyUrl } from "@/lib/web/stream-proxy";
import { resolveStreamSources } from "@/lib/web/stream-resolver";

export const dynamic = "force-dynamic";

export default async function WebPlayerPage({
  params,
  searchParams
}: {
  params: Promise<{ mediaId: string }>;
  searchParams: Promise<{ profile?: string; src?: string }>;
}) {
  const { mediaId } = await params;
  const { profile, src } = await searchParams;
  const profileId = profile?.trim();
  if (!profileId) redirect("/web");

  const ref = decodeMediaId(mediaId);
  if (!ref) notFound();

  const [details, addonsSlice, iptv] = await Promise.all([
    fetchTmdbDetails(ref.mediaType, ref.tmdbId),
    getAddonsSlice(profileId),
    getIptvPlaylistsForProfile(profileId)
  ]);

  const title = details?.title || details?.name || "Lecture MegaTv";
  const year = Number((details?.release_date || details?.first_air_date || "").slice(0, 4)) || null;

  const resolution = await resolveStreamSources(
    {
      mediaType: ref.mediaType,
      tmdbId: ref.tmdbId,
      season: ref.season,
      episode: ref.episode,
      overrideUrl: src || null
    },
    addonsSlice.addons,
    { iptvPlaylists: iptv.playlists, title, year }
  );

  // External subtitle tracks from subtitle-capable Stremio addons (proxied +
  // converted to WebVTT). Skipped for `?src=` overrides (no imdb id resolved).
  let subtitles: PlayerSubtitle[] = [];
  if (resolution.imdbId) {
    const addonSubs = await resolveAddonSubtitles(addonsSlice.addons, {
      mediaType: ref.mediaType,
      imdbId: resolution.imdbId,
      season: ref.season,
      episode: ref.episode
    });
    subtitles = addonSubs.slice(0, 12).map((sub) => ({
      id: sub.id,
      label: sub.label,
      lang: sub.lang.slice(0, 8),
      src: subtitleProxyUrl(sub.url)
    }));
  }

  const backHref = withProfileQuery(`/web/details/${mediaId}`, profileId);
  const resumeKey = `megatv_web_resume_${profileId}_${mediaId}`;

  return (
    <WebPlayerExperience
      sources={resolution.sources}
      subtitles={subtitles}
      title={title}
      backHref={backHref}
      resumeKey={resumeKey}
      addonsHref={withProfileQuery("/companion/manage/addons", profileId)}
      emptyReason={resolution.reason === "ok" || resolution.reason === "override" ? null : resolution.reason}
      track={{
        profileId,
        mediaType: ref.mediaType,
        tmdbId: ref.tmdbId,
        season: ref.season,
        episode: ref.episode,
        imdbId: resolution.imdbId,
        title,
        posterPath: details?.poster_path ?? null,
        backdropPath: details?.backdrop_path ?? null
      }}
    />
  );
}
