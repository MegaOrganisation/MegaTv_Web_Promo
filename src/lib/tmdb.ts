const IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

type TmdbMediaType = "movie" | "tv";

export type TmdbCastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
};

export type TmdbSeasonSummary = {
  id: number;
  name?: string;
  season_number?: number;
  episode_count?: number;
  poster_path?: string | null;
  air_date?: string | null;
  overview?: string | null;
};

export type TmdbSimilarItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type?: string;
};

export type TmdbVideo = {
  key?: string;
  site?: string;
  type?: string;
  official?: boolean;
  name?: string;
};

export type TmdbDetails = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  runtime?: number;
  episode_run_time?: number[];
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genres?: Array<{ id: number; name: string }>;
  number_of_seasons?: number;
  seasons?: TmdbSeasonSummary[];
  credits?: { cast?: TmdbCastMember[] };
  similar?: { results?: TmdbSimilarItem[] };
  videos?: { results?: TmdbVideo[] };
};

export type TmdbEpisodeDetails = {
  id: number;
  name?: string;
  overview?: string;
  still_path?: string | null;
  runtime?: number;
  vote_average?: number;
  season_number?: number;
  episode_number?: number;
  air_date?: string;
};

export type TmdbLogo = {
  file_path: string;
  iso_639_1?: string | null;
  vote_average?: number;
  aspect_ratio?: number;
};

export type TmdbImages = { logos?: TmdbLogo[]; backdrops?: TmdbLogo[] };

export type TmdbPersonCredit = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  character?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  popularity?: number;
};

export type TmdbPerson = {
  id: number;
  name?: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  profile_path?: string | null;
  known_for_department?: string;
  combined_credits?: { cast?: TmdbPersonCredit[] };
};

export function tmdbImageUrl(path: string | null | undefined, size: "w185" | "w342" | "w500" | "w780" | "original" = "w342") {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${IMAGE_BASE}/${size}${path.startsWith("/") ? path : `/${path}`}`;
}

async function fetchTmdbProxy(path: string, append = "", extraParams?: Record<string, string>, revalidate = 60 * 60 * 12) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/tmdb-proxy`;
  const url = new URL(endpoint);
  url.searchParams.set("path", path);
  url.searchParams.set("language", "fr-FR");
  if (append) url.searchParams.set("append_to_response", append);
  if (extraParams) for (const [key, value] of Object.entries(extraParams)) url.searchParams.set(key, value);

  const response = await fetch(url.toString(), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    },
    next: { revalidate }
  });

  if (!response.ok) return null;
  return response.json();
}

export type TmdbSearchResult = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

/** Global multi search (movies + shows), used by `/web/search`. Cached 1h. */
export async function searchTmdbMulti(query: string, page = 1) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [] as TmdbSearchResult[];
  const data = (await fetchTmdbProxy(
    "/search/multi",
    "",
    { query: trimmed, page: String(page), include_adult: "false" },
    60 * 60
  )) as { results?: TmdbSearchResult[] } | null;
  return (data?.results || []).filter((item) => item.media_type === "movie" || item.media_type === "tv");
}

export async function fetchTmdbDetails(mediaType: TmdbMediaType, tmdbId: number) {
  if (!tmdbId) return null;
  return (await fetchTmdbProxy(`/${mediaType}/${tmdbId}`, "credits")) as TmdbDetails | null;
}

/** Lightweight TMDB read for rail modal filters (no credits fan-out). */
export async function fetchTmdbSummary(mediaType: TmdbMediaType, tmdbId: number) {
  if (!tmdbId) return null;
  return (await fetchTmdbProxy(`/${mediaType}/${tmdbId}`, "")) as TmdbDetails | null;
}

/** Rich details for the web `/web/details/[mediaId]` page (seasons, similar, trailer). */
export async function fetchTmdbMediaFull(mediaType: TmdbMediaType, tmdbId: number) {
  if (!tmdbId) return null;
  return (await fetchTmdbProxy(`/${mediaType}/${tmdbId}`, "credits,similar,videos")) as TmdbDetails | null;
}

/** First usable YouTube trailer key from a TMDB videos block. */
export function pickTrailerKey(details: TmdbDetails | null | undefined) {
  const videos = details?.videos?.results || [];
  const youtube = videos.filter((video) => (video.site || "").toLowerCase() === "youtube" && video.key);
  const trailer = youtube.find((video) => (video.type || "").toLowerCase() === "trailer") || youtube[0];
  return trailer?.key || null;
}

/**
 * Title logos + backdrops for a TMDB title (`/images`). Used to overlay the
 * TMDB title logo on landscape cards / hero, matching the Android app.
 * `include_image_language=fr,en,null` so we get a localized logo when it exists.
 * Cached 24h via the proxy — call at most once per title, never per rail render.
 */
export async function fetchTmdbImages(mediaType: TmdbMediaType, tmdbId: number) {
  if (!tmdbId) return null;
  return (await fetchTmdbProxy(
    `/${mediaType}/${tmdbId}/images`,
    "",
    { include_image_language: "fr,en,null" },
    60 * 60 * 24
  )) as TmdbImages | null;
}

/** Best title logo path from a TMDB images block (prefers fr, then en, then any). */
export function pickTitleLogo(images: TmdbImages | null | undefined, preferLang: "fr" | "en" = "fr"): string | null {
  const logos = (images?.logos || []).filter((logo) => logo.file_path);
  if (logos.length === 0) return null;
  const byLang = (lang: string) => logos.filter((logo) => (logo.iso_639_1 || "").toLowerCase() === lang);
  const pool =
    byLang(preferLang).length > 0
      ? byLang(preferLang)
      : byLang("en").length > 0
        ? byLang("en")
        : logos;
  const best = [...pool].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))[0];
  return best?.file_path || null;
}

/** Person bio + filmography for the actor modal (`/person/{id}` + combined_credits). Cached 24h. */
export async function fetchTmdbPerson(personId: number) {
  if (!personId) return null;
  return (await fetchTmdbProxy(`/person/${personId}`, "combined_credits", undefined, 60 * 60 * 24)) as TmdbPerson | null;
}

export async function fetchTmdbEpisodeDetails(showTmdbId: number, season: number, episode: number) {
  if (!showTmdbId || !season || !episode) return null;
  return (await fetchTmdbProxy(`/tv/${showTmdbId}/season/${season}/episode/${episode}`)) as TmdbEpisodeDetails | null;
}

type TmdbExternalIds = { imdb_id?: string | null };

/**
 * Resolves the IMDb id (`tt…`) for a TMDB title. Stremio addons key streams on
 * IMDb ids, so this is the bridge between our TMDB-based catalog and addon
 * stream lists. Cached 24h via the proxy. Returns null when unavailable.
 */
export async function fetchImdbId(mediaType: TmdbMediaType, tmdbId: number): Promise<string | null> {
  if (!tmdbId) return null;
  const data = (await fetchTmdbProxy(`/${mediaType}/${tmdbId}/external_ids`, "", undefined, 60 * 60 * 24)) as
    | TmdbExternalIds
    | null;
  const imdb = data?.imdb_id?.trim();
  return imdb && /^tt\d+$/i.test(imdb) ? imdb : null;
}

export async function fetchTmdbEpisodeWithShow(showTmdbId: number, season: number, episode: number) {
  const [show, episodeDetails] = await Promise.all([
    fetchTmdbDetails("tv", showTmdbId),
    fetchTmdbEpisodeDetails(showTmdbId, season, episode)
  ]);
  if (!show && !episodeDetails) return null;
  return { show, episode: episodeDetails };
}

export function pickDisplayTitle(item: { title?: string | null; episode_title?: string | null; media_type?: string | null }) {
  if (item.media_type === "tv" && item.episode_title) return item.episode_title;
  return item.title || item.episode_title || "Contenu MegaTv";
}

export function formatRuntimeMinutes(minutes: number | null | undefined) {
  const value = Math.max(0, Number(minutes || 0));
  if (value <= 0) return null;
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return mins > 0 ? `${hours} h ${mins.toString().padStart(2, "0")}` : `${hours} h`;
}
