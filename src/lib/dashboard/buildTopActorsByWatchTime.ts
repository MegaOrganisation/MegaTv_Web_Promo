/**
 * Agrège le temps de visionnage par acteur (crédits TMDB).
 * Si 2 films avec le même acteur → cumul des watch_seconds.
 */
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";
import type { TopContentRow } from "@/lib/supabase/types";
import { buildTopContentByWatchTime } from "@/lib/dashboard/buildTopContentByWatchTime";
import {
  fetchTmdbDetails,
  fetchTmdbProxyPublic,
  tmdbProxiedImageUrl,
  type TmdbCastMember,
  type TmdbDetails
} from "@/lib/tmdb";

export type TopActorRow = {
  id: number;
  name: string;
  profilePath: string | null;
  imageUrl: string | null;
  watchSeconds: number;
  titles: string[];
};

const CAST_PER_TITLE = 8;
const MAX_TITLES = 12;
const MAX_ACTORS = 8;

async function fetchCastForTitle(
  mediaType: "movie" | "tv",
  tmdbId: number
): Promise<TmdbCastMember[]> {
  const details = (await fetchTmdbDetails(mediaType, tmdbId)) as TmdbDetails | null;
  let cast = details?.credits?.cast || [];
  if (cast.length > 0) return cast.slice(0, CAST_PER_TITLE);

  // Fallback si append_to_response credits est stripé par le proxy
  const creditsOnly = (await fetchTmdbProxyPublic(
    `/${mediaType}/${tmdbId}/credits`,
    "",
    undefined,
    60 * 60 * 12
  )) as { cast?: TmdbCastMember[] } | null;
  cast = creditsOnly?.cast || [];
  return cast.slice(0, CAST_PER_TITLE);
}

export async function buildTopActorsByWatchTime(
  history: WatchHistoryRow[],
  rpcFallback: TopContentRow[] = [],
  limit = MAX_ACTORS
): Promise<TopActorRow[]> {
  const topTitles = buildTopContentByWatchTime(history, rpcFallback, MAX_TITLES);
  const enriched = topTitles
    .map((t) => ({
      ...t,
      watch_seconds: Math.max(60, Number(t.watch_seconds) || 0)
    }))
    .filter((t) => Number(t.tmdb_id) > 0 && (t.media_type === "movie" || t.media_type === "tv"))
    .slice(0, MAX_TITLES);

  if (enriched.length === 0) return [];

  const byActor = new Map<
    number,
    { name: string; profilePath: string | null; watchSeconds: number; titles: Set<string> }
  >();

  await Promise.all(
    enriched.map(async (title) => {
      try {
        const cast = await fetchCastForTitle(title.media_type, title.tmdb_id);
        const seconds = Math.max(60, Number(title.watch_seconds) || 60);
        if (cast.length === 0) return;

        for (const member of cast) {
          if (!member?.id || !member.name) continue;
          const prev = byActor.get(member.id);
          if (!prev) {
            byActor.set(member.id, {
              name: member.name,
              profilePath: member.profile_path || null,
              watchSeconds: seconds,
              titles: new Set(title.title ? [title.title] : [])
            });
          } else {
            prev.watchSeconds += seconds;
            if (!prev.profilePath && member.profile_path) prev.profilePath = member.profile_path;
            if (title.title) prev.titles.add(title.title);
          }
        }
      } catch {
        /* titre isolé en échec — on continue */
      }
    })
  );

  return Array.from(byActor.entries())
    .map(([id, row]) => ({
      id,
      name: row.name,
      profilePath: row.profilePath,
      imageUrl: tmdbProxiedImageUrl(row.profilePath, "w185"),
      watchSeconds: row.watchSeconds,
      titles: Array.from(row.titles).slice(0, 4)
    }))
    .sort((a, b) => b.watchSeconds - a.watchSeconds)
    .slice(0, limit);
}
