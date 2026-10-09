/**
 * Home collection rails (Services / Genres / Studios) — parity with Android
 * `CollectionTemplateManifest` + drawable-nodpi covers copied to
 * `/assets/collections/`.
 *
 * Click opens `/web/collection/{id}` which discovers via TMDB (watch provider /
 * genre / company) — no Stremio addon required on web.
 */

export type CollectionGroup = "SERVICE" | "GENRE" | "FRANCHISE";

export type CollectionTile = {
  id: string;
  title: string;
  group: CollectionGroup;
  /** Local cover under /assets/collections/ */
  coverFile: string;
  /** TMDB discover hints for the collection page. */
  tmdb?: {
    watchProviderId?: number;
    genreId?: number;
    companyId?: number;
    mediaType?: "movie" | "tv" | "both";
  };
};

export const COLLECTION_RAIL_META: Record<CollectionGroup, { title: string; railId: string }> = {
  SERVICE: { title: "Services", railId: "collection_rail_service" },
  GENRE: { title: "Genres", railId: "collection_rail_genre" },
  FRANCHISE: { title: "Studios", railId: "collection_rail_franchise" }
};

/** Ordered like Android Home rails. */
export const COLLECTION_TILES: CollectionTile[] = [
  // Services
  { id: "collection_service_netflix", title: "Netflix", group: "SERVICE", coverFile: "service_netflix.png", tmdb: { watchProviderId: 8, mediaType: "both" } },
  { id: "collection_service_disneyplus", title: "Disney+", group: "SERVICE", coverFile: "service_disney_plus.png", tmdb: { watchProviderId: 337, mediaType: "both" } },
  { id: "collection_service_apple_tvplus", title: "Apple TV+", group: "SERVICE", coverFile: "service_apple_tv.png", tmdb: { watchProviderId: 350, mediaType: "both" } },
  { id: "collection_service_prime_video", title: "Prime Video", group: "SERVICE", coverFile: "service_prime_video.png", tmdb: { watchProviderId: 9, mediaType: "both" } },
  { id: "collection_service_hbo_max", title: "HBO Max", group: "SERVICE", coverFile: "service_hbo_max.png", tmdb: { watchProviderId: 1899, mediaType: "both" } },
  { id: "collection_service_hulu", title: "Hulu", group: "SERVICE", coverFile: "service_hulu.png", tmdb: { watchProviderId: 15, mediaType: "both" } },
  { id: "collection_service_paramountplus", title: "Paramount+", group: "SERVICE", coverFile: "service_paramount_plus.png", tmdb: { watchProviderId: 531, mediaType: "both" } },
  { id: "collection_service_peacock", title: "Peacock", group: "SERVICE", coverFile: "service_peacock.png", tmdb: { watchProviderId: 386, mediaType: "both" } },
  { id: "collection_service_starz", title: "Starz", group: "SERVICE", coverFile: "service_starz.png", tmdb: { watchProviderId: 43, mediaType: "both" } },
  { id: "collection_service_shudder", title: "Shudder", group: "SERVICE", coverFile: "service_shudder.png", tmdb: { watchProviderId: 99, mediaType: "both" } },
  { id: "collection_service_mgmplus", title: "MGM+", group: "SERVICE", coverFile: "service_mgm_plus.png", tmdb: { watchProviderId: 34, mediaType: "both" } },
  { id: "collection_service_discoveryplus", title: "Discovery+", group: "SERVICE", coverFile: "service_discovery_plus.png", tmdb: { watchProviderId: 520, mediaType: "both" } },
  { id: "collection_service_crunchyroll", title: "Crunchyroll", group: "SERVICE", coverFile: "service_crunchyroll.png", tmdb: { watchProviderId: 283, mediaType: "tv" } },
  // Genres
  { id: "collection_genre_action", title: "Action", group: "GENRE", coverFile: "genre_action.png", tmdb: { genreId: 28, mediaType: "movie" } },
  { id: "collection_genre_comedy", title: "Comedy", group: "GENRE", coverFile: "genre_comedy.png", tmdb: { genreId: 35, mediaType: "both" } },
  { id: "collection_genre_sci_fi", title: "Sci-Fi", group: "GENRE", coverFile: "genre_scifi.png", tmdb: { genreId: 878, mediaType: "movie" } },
  { id: "collection_genre_thriller", title: "Thriller", group: "GENRE", coverFile: "genre_thriller.png", tmdb: { genreId: 53, mediaType: "movie" } },
  { id: "collection_genre_drama", title: "Drama", group: "GENRE", coverFile: "genre_drama.png", tmdb: { genreId: 18, mediaType: "both" } },
  { id: "collection_genre_horror", title: "Horror", group: "GENRE", coverFile: "genre_horror.png", tmdb: { genreId: 27, mediaType: "movie" } },
  { id: "collection_genre_documentary", title: "Documentary", group: "GENRE", coverFile: "genre_documentary.png", tmdb: { genreId: 99, mediaType: "both" } },
  { id: "collection_genre_romance", title: "Romance", group: "GENRE", coverFile: "genre_romance.png", tmdb: { genreId: 10749, mediaType: "movie" } },
  { id: "collection_genre_animation", title: "Animation", group: "GENRE", coverFile: "genre_animation.png", tmdb: { genreId: 16, mediaType: "both" } },
  { id: "collection_genre_family", title: "Family", group: "GENRE", coverFile: "genre_family.png", tmdb: { genreId: 10751, mediaType: "movie" } },
  { id: "collection_genre_fantasy", title: "Fantasy", group: "GENRE", coverFile: "genre_fantasy.png", tmdb: { genreId: 14, mediaType: "movie" } },
  { id: "collection_genre_adventure", title: "Adventure", group: "GENRE", coverFile: "genre_adventure.png", tmdb: { genreId: 12, mediaType: "movie" } },
  { id: "collection_genre_superhero", title: "Superhero", group: "GENRE", coverFile: "genre_superhero.png", tmdb: { genreId: 28, mediaType: "movie" } },
  { id: "collection_genre_war_and_military", title: "War & Military", group: "GENRE", coverFile: "genre_war_military.png", tmdb: { genreId: 10752, mediaType: "movie" } },
  // Studios (FRANCHISE group)
  { id: "collection_franchise_marvel", title: "Marvel", group: "FRANCHISE", coverFile: "studio_marvel.png", tmdb: { companyId: 420, mediaType: "both" } },
  { id: "collection_franchise_dc", title: "DC", group: "FRANCHISE", coverFile: "studio_dc.png", tmdb: { companyId: 9993, mediaType: "both" } },
  { id: "collection_franchise_pixar", title: "Pixar", group: "FRANCHISE", coverFile: "studio_pixar.png", tmdb: { companyId: 3, mediaType: "movie" } },
  { id: "collection_franchise_dreamworks", title: "DreamWorks", group: "FRANCHISE", coverFile: "studio_dreamworks.png", tmdb: { companyId: 521, mediaType: "movie" } },
  { id: "collection_franchise_ghibli", title: "Ghibli", group: "FRANCHISE", coverFile: "studio_ghibli.png", tmdb: { companyId: 10342, mediaType: "movie" } },
  { id: "collection_franchise_lucasfilm", title: "Lucasfilm", group: "FRANCHISE", coverFile: "studio_lucasfilm.png", tmdb: { companyId: 1, mediaType: "movie" } },
  { id: "collection_franchise_star_wars", title: "Star Wars", group: "FRANCHISE", coverFile: "studio_star_wars.png", tmdb: { companyId: 1, mediaType: "both" } },
  { id: "collection_franchise_cartoon_network", title: "Cartoon Network", group: "FRANCHISE", coverFile: "studio_cartoon_network.png", tmdb: { companyId: 8169, mediaType: "tv" } },
  { id: "collection_franchise_nickelodeon", title: "Nickelodeon", group: "FRANCHISE", coverFile: "studio_nickelodeon.png", tmdb: { companyId: 2348, mediaType: "tv" } }
];

export function tilesForGroup(group: CollectionGroup): CollectionTile[] {
  return COLLECTION_TILES.filter((tile) => tile.group === group);
}

export function tileById(id: string): CollectionTile | null {
  return COLLECTION_TILES.find((tile) => tile.id === id) || null;
}

export function collectionCoverUrl(tile: CollectionTile): string {
  return `/assets/collections/${tile.coverFile}`;
}
