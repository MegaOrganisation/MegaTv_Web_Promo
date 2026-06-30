const IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

type TmdbMediaType = "movie" | "tv";

type TmdbDetails = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
};

export function tmdbImageUrl(path: string | null | undefined, size: "w185" | "w342" | "w500" | "w780" | "original" = "w342") {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${IMAGE_BASE}/${size}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchTmdbDetails(mediaType: TmdbMediaType, tmdbId: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey || !tmdbId) return null;

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/tmdb-proxy`;
  const url = new URL(endpoint);
  url.searchParams.set("path", `/${mediaType}/${tmdbId}`);
  url.searchParams.set("language", "fr-FR");
  url.searchParams.set("append_to_response", "images");

  const response = await fetch(url.toString(), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    },
    next: { revalidate: 60 * 60 * 12 }
  });

  if (!response.ok) return null;
  return (await response.json()) as TmdbDetails;
}

export function pickDisplayTitle(item: { title?: string | null; episode_title?: string | null; media_type?: string | null }) {
  if (item.media_type === "tv" && item.episode_title) return item.episode_title;
  return item.title || item.episode_title || "Contenu MegaTv";
}
