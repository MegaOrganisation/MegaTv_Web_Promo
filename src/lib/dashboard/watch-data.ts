import { createClient } from "@/lib/supabase/server";
import { fetchTmdbDetails, fetchTmdbEpisodeWithShow } from "@/lib/tmdb";

export type WatchHistoryRow = {
  id: string;
  profile_id: string | null;
  media_type: "movie" | "tv";
  tmdb_id: number;
  season: number | null;
  episode: number | null;
  title: string | null;
  episode_title: string | null;
  poster_path: string | null;
  progress: number | null;
  event_type: string;
  watch_seconds: number;
  created_at: string;
};

type ConnectionTrackRow = {
  id: string;
  profile_id: string;
  media_type: string | null;
  show_tmdb_id: number | null;
  season: number | null;
  episode: number | null;
  title: string | null;
  episode_title: string | null;
  poster_path: string | null;
  progress: number | null;
  progress_seconds: number | null;
  paused_at: string | null;
  updated_at: string;
  created_at: string;
};

type WatchedMovieRow = {
  id: string;
  profile_id: string;
  tmdb_id: number;
  watched_at: string;
};

type WatchedEpisodeRow = {
  id: string;
  profile_id: string;
  tmdb_id: number;
  season: number;
  episode: number;
  watched_at: string;
};

type WebWatchEventRow = {
  id: string;
  profile_id: string | null;
  media_type: string;
  tmdb_id: number;
  season: number | null;
  episode: number | null;
  event_type: string;
  watch_seconds: number;
  created_at: string;
};

const TRACK_LIMIT = 250;
const WATCHED_LIMIT = 150;
const DEDUP_WINDOW_MS = 15 * 60 * 1000;

function normalizeMediaType(mediaType: string | null, season: number | null, episode: number | null): "movie" | "tv" {
  const value = (mediaType || "").toLowerCase();
  if (value === "tv" || value === "series" || value === "show" || (season != null && episode != null)) return "tv";
  return "movie";
}

function contentKey(mediaType: "movie" | "tv", tmdbId: number, season: number | null, episode: number | null) {
  if (mediaType === "tv") return `tv:${tmdbId}:${season ?? 0}:${episode ?? 0}`;
  return `movie:${tmdbId}`;
}

function parseTime(value: string | null | undefined) {
  if (!value) return 0;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

function trackToRow(track: ConnectionTrackRow): WatchHistoryRow | null {
  const tmdbId = Number(track.show_tmdb_id);
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) return null;

  const mediaType = normalizeMediaType(track.media_type, track.season, track.episode);
  const progress = Number(track.progress) || 0;
  const createdAt = track.updated_at || track.paused_at || track.created_at;

  return {
    id: track.id,
    profile_id: track.profile_id,
    media_type: mediaType,
    tmdb_id: tmdbId,
    season: track.season,
    episode: track.episode,
    title: track.title,
    episode_title: track.episode_title,
    poster_path: track.poster_path,
    progress,
    event_type: progress >= 0.9 ? "completed" : "progress",
    watch_seconds: Math.max(0, Number(track.progress_seconds) || 0),
    created_at: createdAt
  };
}

function registerTrackTimestamp(map: Map<string, number>, row: WatchHistoryRow) {
  const key = contentKey(row.media_type, row.tmdb_id, row.season, row.episode);
  const ts = parseTime(row.created_at);
  const prev = map.get(key) ?? 0;
  if (ts > prev) map.set(key, ts);
}

function isCoveredByTrack(map: Map<string, number>, key: string, watchedAt: string) {
  const trackTs = map.get(key);
  if (!trackTs) return false;
  return Math.abs(parseTime(watchedAt) - trackTs) <= DEDUP_WINDOW_MS;
}

function applyProfileFilter<T extends { eq: (col: string, val: string) => T }>(query: T, profileId?: string | null) {
  return profileId ? query.eq("profile_id", profileId) : query;
}

/**
 * Historique aligné sur l'app Android : `profile_connection_tracks` (sessions de lecture),
 * complété par `watched_movies` / `watched_episodes` (marquages Trakt) et
 * `megacompanion_watch_events` (futurs événements web Companion).
 */
export async function getWatchHistory(profileId?: string | null, limit = 50) {
  const supabase = await createClient();

  let tracksQuery = supabase
    .from("profile_connection_tracks")
    .select(
      "id,profile_id,media_type,show_tmdb_id,season,episode,title,episode_title,poster_path,progress,progress_seconds,paused_at,updated_at,created_at"
    )
    .gt("progress_seconds", 0)
    .order("updated_at", { ascending: false })
    .limit(TRACK_LIMIT);

  let moviesQuery = supabase
    .from("watched_movies")
    .select("id,profile_id,tmdb_id,watched_at")
    .order("watched_at", { ascending: false })
    .limit(WATCHED_LIMIT);

  let episodesQuery = supabase
    .from("watched_episodes")
    .select("id,profile_id,tmdb_id,season,episode,watched_at")
    .order("watched_at", { ascending: false })
    .limit(WATCHED_LIMIT);

  let webQuery = supabase
    .from("megacompanion_watch_events")
    .select("id,profile_id,media_type,tmdb_id,season,episode,event_type,watch_seconds,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  tracksQuery = applyProfileFilter(tracksQuery, profileId);
  moviesQuery = applyProfileFilter(moviesQuery, profileId);
  episodesQuery = applyProfileFilter(episodesQuery, profileId);
  if (profileId) webQuery = webQuery.eq("profile_id", profileId);

  const [tracksRes, moviesRes, episodesRes, webRes] = await Promise.all([
    tracksQuery,
    moviesQuery,
    episodesQuery,
    webQuery
  ]);

  const errors = [tracksRes.error, moviesRes.error, episodesRes.error, webRes.error]
    .map((e) => e?.message)
    .filter(Boolean);

  const trackRows = ((tracksRes.data || []) as ConnectionTrackRow[])
    .map(trackToRow)
    .filter((row): row is WatchHistoryRow => row != null);

  const latestTrackByContent = new Map<string, number>();
  for (const row of trackRows) registerTrackTimestamp(latestTrackByContent, row);

  const merged: WatchHistoryRow[] = [...trackRows];

  for (const movie of (moviesRes.data || []) as WatchedMovieRow[]) {
    const key = contentKey("movie", movie.tmdb_id, null, null);
    if (isCoveredByTrack(latestTrackByContent, key, movie.watched_at)) continue;
    merged.push({
      id: `wm-${movie.id}`,
      profile_id: movie.profile_id,
      media_type: "movie",
      tmdb_id: movie.tmdb_id,
      season: null,
      episode: null,
      title: null,
      episode_title: null,
      poster_path: null,
      progress: 1,
      event_type: "watched",
      watch_seconds: 0,
      created_at: movie.watched_at
    });
  }

  for (const episode of (episodesRes.data || []) as WatchedEpisodeRow[]) {
    const key = contentKey("tv", episode.tmdb_id, episode.season, episode.episode);
    if (isCoveredByTrack(latestTrackByContent, key, episode.watched_at)) continue;
    merged.push({
      id: `we-${episode.id}`,
      profile_id: episode.profile_id,
      media_type: "tv",
      tmdb_id: episode.tmdb_id,
      season: episode.season,
      episode: episode.episode,
      title: null,
      episode_title: null,
      poster_path: null,
      progress: 1,
      event_type: "watched",
      watch_seconds: 0,
      created_at: episode.watched_at
    });
  }

  for (const event of (webRes.data || []) as WebWatchEventRow[]) {
    const mediaType = normalizeMediaType(event.media_type, event.season, event.episode);
    merged.push({
      id: `web-${event.id}`,
      profile_id: event.profile_id,
      media_type: mediaType,
      tmdb_id: event.tmdb_id,
      season: event.season,
      episode: event.episode,
      title: null,
      episode_title: null,
      poster_path: null,
      progress: null,
      event_type: event.event_type || "web",
      watch_seconds: Math.max(0, Number(event.watch_seconds) || 0),
      created_at: event.created_at
    });
  }

  const rows = merged
    .sort((a, b) => parseTime(b.created_at) - parseTime(a.created_at))
    .slice(0, Math.max(1, limit));

  const enriched = await enrichWatchHistoryRows(rows);

  return { rows: enriched, error: errors[0] || null };
}

const enrichmentCache = new Map<string, Partial<WatchHistoryRow>>();

async function enrichWatchHistoryRows(rows: WatchHistoryRow[]) {
  const needsEnrichment = rows.filter((row) => !row.title?.trim() || !row.poster_path);
  if (needsEnrichment.length === 0) return rows;

  const batch = needsEnrichment.slice(0, 24);
  await Promise.all(
    batch.map(async (row) => {
      const cacheKey =
        row.media_type === "tv" && row.season && row.episode
          ? `tv:${row.tmdb_id}:${row.season}:${row.episode}`
          : `${row.media_type}:${row.tmdb_id}`;
      if (enrichmentCache.has(cacheKey)) return;

      if (row.media_type === "tv" && row.season && row.episode) {
        const bundle = await fetchTmdbEpisodeWithShow(row.tmdb_id, row.season, row.episode);
        if (!bundle) return;
        enrichmentCache.set(cacheKey, {
          title: bundle.show?.name || row.title,
          episode_title: bundle.episode?.name || row.episode_title,
          poster_path: bundle.show?.poster_path || bundle.episode?.still_path || row.poster_path
        });
        return;
      }

      const details = await fetchTmdbDetails(row.media_type, row.tmdb_id);
      if (!details) return;
      enrichmentCache.set(cacheKey, {
        title: details.title || details.name || row.title,
        poster_path: details.poster_path || row.poster_path
      });
    })
  );

  return rows.map((row) => {
    const cacheKey =
      row.media_type === "tv" && row.season && row.episode
        ? `tv:${row.tmdb_id}:${row.season}:${row.episode}`
        : `${row.media_type}:${row.tmdb_id}`;
    const patch = enrichmentCache.get(cacheKey);
    return patch ? { ...row, ...patch } : row;
  });
}

export type WatchlistItem = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  addedAt?: number;
};

export async function getWatchlistForProfile(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("v_account_sync_watchlist").select("watchlist_by_profile").maybeSingle();

  if (error || !data?.watchlist_by_profile) {
    return { items: [] as WatchlistItem[], error: error?.message || null };
  }

  const map = data.watchlist_by_profile as Record<string, unknown>;
  const raw = map[profileId];
  const items = Array.isArray(raw)
    ? raw.map((entry) => normalizeWatchlistItem(entry as Record<string, unknown>)).filter(Boolean)
    : [];

  return { items: items as WatchlistItem[], error: null };
}

function normalizeWatchlistItem(raw: Record<string, unknown>): WatchlistItem | null {
  const tmdbId = Number(raw.tmdbId ?? raw.tmdb_id);
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) return null;
  const mediaType = String(raw.mediaType ?? raw.media_type ?? "movie").toLowerCase() === "tv" ? "tv" : "movie";
  return {
    tmdbId,
    mediaType,
    title: String(raw.title || `TMDB ${tmdbId}`),
    posterPath: (raw.posterPath ?? raw.poster_path) as string | null | undefined,
    backdropPath: (raw.backdropPath ?? raw.backdrop_path) as string | null | undefined,
    addedAt: Number(raw.addedAt ?? raw.added_at ?? 0) || undefined
  };
}
