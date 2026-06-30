export type ProfileRow = {
  user_id: string;
  profile_id: string;
  name: string | null;
  avatar_color: number | null;
  avatar_id: number | null;
  avatar_image_version: number | null;
  avatar_image_storage_path: string | null;
  is_kids_profile: boolean | null;
  is_locked: boolean | null;
  last_used_at: number | null;
  updated_at: string | null;
};

export type DeviceRow = {
  user_id: string;
  device_id: string;
  display_name: string | null;
  default_label: string | null;
  device_type: string | null;
  manufacturer: string | null;
  model: string | null;
  app_version: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  updated_at: string | null;
};

export type ContinueWatchingRow = {
  user_id: string;
  profile_id: string | null;
  track_id: string;
  media_type: "movie" | "tv";
  tmdb_id: number | null;
  season: number | null;
  episode: number | null;
  title: string | null;
  episode_title: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  progress: number | null;
  progress_seconds: number | null;
  total_duration_seconds: number | null;
  paused_at: string | null;
  updated_at: string | null;
  source: string | null;
};

export type DashboardSummary = {
  profile_count: number;
  device_count: number;
  continue_watching_count: number;
  movies_watched: number;
  episodes_watched: number;
  total_watch_seconds: number;
  page_views_30d: number;
  last_activity_at: string | null;
};

export type TopContentRow = {
  media_type: "movie" | "tv";
  tmdb_id: number;
  season: number | null;
  episode: number | null;
  title: string | null;
  episode_title: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  watch_seconds: number;
  progress: number | null;
  last_watched_at: string | null;
};
