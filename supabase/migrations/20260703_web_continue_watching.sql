-- =============================================================================
-- MegaTv Web P3 — Continue Watching cloud write (profile-scoped, batched)
-- Upserts a single playback progress row into profile_connection_tracks using
-- the same deterministic key as the Android app
-- (user_id, profile_id, media_type, show_tmdb_id, season, episode, source).
--
-- Runs as SECURITY INVOKER (default): RLS on profile_connection_tracks scopes
-- every row to auth.uid(), and this function additionally double-checks the
-- profile belongs to the caller. The manual select-then-upsert avoids relying
-- on the expression unique index (PostgREST cannot target it for on_conflict).
-- Callers debounce/batch (never per-second) — one coalesced row per flush.
-- =============================================================================
create or replace function public.megacompanion_upsert_connection_track(
  p_profile_id text,
  p_media_type text,
  p_tmdb_id integer,
  p_season integer default null,
  p_episode integer default null,
  p_progress real default 0,
  p_progress_seconds bigint default 0,
  p_total_duration_seconds bigint default 0,
  p_title text default null,
  p_episode_title text default null,
  p_poster_path text default null,
  p_backdrop_path text default null,
  p_source text default 'web'
)
returns jsonb
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid := auth.uid();
  v_profile_id text := nullif(trim(p_profile_id), '');
  v_media_type text := lower(coalesce(nullif(trim(p_media_type), ''), 'movie'));
  v_source text := coalesce(nullif(trim(p_source), ''), 'web');
  v_track_id uuid;
begin
  if v_uid is null then
    raise exception 'authenticated user required' using errcode = '28000';
  end if;
  if v_profile_id is null then
    raise exception 'profile_id required' using errcode = '22023';
  end if;
  if v_media_type not in ('movie', 'tv') then
    v_media_type := 'movie';
  end if;
  if p_tmdb_id is null or p_tmdb_id <= 0 then
    raise exception 'tmdb_id required' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.user_profiles up
    where up.user_id = v_uid and up.id = v_profile_id
  ) then
    raise exception 'profile not found' using errcode = '42501';
  end if;

  -- Deterministic key match (coalesce mirrors the unique index expressions).
  select id into v_track_id
  from public.profile_connection_tracks
  where user_id = v_uid
    and profile_id = v_profile_id
    and media_type = v_media_type
    and coalesce(show_tmdb_id, -1) = coalesce(p_tmdb_id, -1)
    and coalesce(season, -1) = coalesce(p_season, -1)
    and coalesce(episode, -1) = coalesce(p_episode, -1)
    and coalesce(source, '') = coalesce(v_source, '')
  limit 1;

  if v_track_id is not null then
    update public.profile_connection_tracks
    set progress = greatest(0, coalesce(p_progress, 0)),
        progress_seconds = greatest(0, coalesce(p_progress_seconds, 0)),
        total_duration_seconds = greatest(total_duration_seconds, coalesce(p_total_duration_seconds, 0)),
        title = coalesce(nullif(trim(p_title), ''), title),
        episode_title = coalesce(nullif(trim(p_episode_title), ''), episode_title),
        poster_path = coalesce(nullif(trim(p_poster_path), ''), poster_path),
        backdrop_path = coalesce(nullif(trim(p_backdrop_path), ''), backdrop_path),
        paused_at = now(),
        updated_at = now()
    where id = v_track_id;
  else
    insert into public.profile_connection_tracks (
      user_id, profile_id, media_type, show_tmdb_id, season, episode,
      progress, progress_seconds, total_duration_seconds,
      title, episode_title, poster_path, backdrop_path, source, paused_at
    ) values (
      v_uid, v_profile_id, v_media_type, p_tmdb_id, p_season, p_episode,
      greatest(0, coalesce(p_progress, 0)), greatest(0, coalesce(p_progress_seconds, 0)),
      greatest(0, coalesce(p_total_duration_seconds, 0)),
      nullif(trim(p_title), ''), nullif(trim(p_episode_title), ''),
      nullif(trim(p_poster_path), ''), nullif(trim(p_backdrop_path), ''), v_source, now()
    )
    returning id into v_track_id;
  end if;

  return jsonb_build_object('track_id', v_track_id, 'profile_id', v_profile_id);
end;
$$;

revoke all on function public.megacompanion_upsert_connection_track(
  text, text, integer, integer, integer, real, bigint, bigint, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.megacompanion_upsert_connection_track(
  text, text, integer, integer, integer, real, bigint, bigint, text, text, text, text, text
) to authenticated;
