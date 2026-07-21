-- INC-WEB-038 : hidden channels + cascade prefs IPTV à suppression de liste (+ TTL 7j)
-- Appliqué via `supabase db query --linked` (historique migrations remote désynchronisé).

-- ── 1) Catégories masquées (idempotent) ─────────────────────────────────────
create or replace function public.megacompanion_patch_iptv_hidden_categories(
  p_profile_id text,
  p_hidden_categories jsonb
)
returns jsonb
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid := auth.uid();
  v_profile_id text := nullif(trim(p_profile_id), '');
  v_payload jsonb;
  v_iptv_by_profile jsonb;
  v_profile_state jsonb;
  v_existing jsonb;
  v_updated_at bigint;
begin
  if v_uid is null then
    raise exception 'authenticated user required' using errcode = '28000';
  end if;
  if v_profile_id is null then
    raise exception 'profile_id required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.user_profiles up
    where up.user_id = v_uid and up.id = v_profile_id
  ) then
    raise exception 'profile not found' using errcode = '42501';
  end if;
  if jsonb_typeof(p_hidden_categories) is distinct from 'array' then
    raise exception 'hidden_categories must be a JSON array' using errcode = '22023';
  end if;

  select coalesce(ass.payload::jsonb, '{}'::jsonb)
  into v_payload
  from public.account_sync_state ass
  where ass.user_id = v_uid
  for update;

  if not found then
    v_payload := jsonb_build_object('version', 2, 'userId', v_uid::text);
  end if;

  v_iptv_by_profile := coalesce(v_payload -> 'iptvByProfile', '{}'::jsonb);
  v_profile_state := coalesce(v_iptv_by_profile -> v_profile_id, '{}'::jsonb);
  v_existing := coalesce(v_profile_state -> 'hiddenCategories', '[]'::jsonb);
  -- Mirror into hiddenGroups: Android Live TV historically read that field;
  -- export still serializes both. Keep them identical on Companion writes.
  v_profile_state := v_profile_state || jsonb_build_object(
    'hiddenCategories', p_hidden_categories,
    'hiddenGroups', p_hidden_categories
  );
  v_iptv_by_profile := v_iptv_by_profile || jsonb_build_object(v_profile_id, v_profile_state);
  v_updated_at := greatest(
    coalesce((v_payload ->> 'updatedAt')::bigint, 0) + 1,
    (extract(epoch from clock_timestamp()) * 1000)::bigint
  );
  v_payload := v_payload || jsonb_build_object(
    'iptvByProfile', v_iptv_by_profile,
    'updatedAt', v_updated_at,
    'userId', v_uid::text,
    'version', greatest(coalesce((v_payload ->> 'version')::integer, 1), 2)
  );

  insert into public.account_sync_state (user_id, payload, updated_at)
  values (v_uid, v_payload::text, now())
  on conflict (user_id) do update
    set payload = excluded.payload, updated_at = excluded.updated_at;

  return jsonb_build_object(
    'profile_id', v_profile_id,
    'hidden_count', jsonb_array_length(p_hidden_categories),
    'updated_at', v_updated_at,
    'previous_count', jsonb_array_length(v_existing)
  );
end;
$$;

revoke all on function public.megacompanion_patch_iptv_hidden_categories(text, jsonb) from public, anon, authenticated;
grant execute on function public.megacompanion_patch_iptv_hidden_categories(text, jsonb) to authenticated;

-- ── 2) Chaînes masquées (idempotent) ────────────────────────────────────────
create or replace function public.megacompanion_patch_iptv_hidden_channels(
  p_profile_id text,
  p_hidden_channels jsonb
)
returns jsonb
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid := auth.uid();
  v_profile_id text := nullif(trim(p_profile_id), '');
  v_payload jsonb;
  v_iptv_by_profile jsonb;
  v_profile_state jsonb;
  v_existing jsonb;
  v_updated_at bigint;
begin
  if v_uid is null then
    raise exception 'authenticated user required' using errcode = '28000';
  end if;
  if v_profile_id is null then
    raise exception 'profile_id required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.user_profiles up
    where up.user_id = v_uid and up.id = v_profile_id
  ) then
    raise exception 'profile not found' using errcode = '42501';
  end if;
  if jsonb_typeof(p_hidden_channels) is distinct from 'array' then
    raise exception 'hidden_channels must be a JSON array' using errcode = '22023';
  end if;

  select coalesce(ass.payload::jsonb, '{}'::jsonb)
  into v_payload
  from public.account_sync_state ass
  where ass.user_id = v_uid
  for update;

  if not found then
    v_payload := jsonb_build_object('version', 2, 'userId', v_uid::text);
  end if;

  v_iptv_by_profile := coalesce(v_payload -> 'iptvByProfile', '{}'::jsonb);
  v_profile_state := coalesce(v_iptv_by_profile -> v_profile_id, '{}'::jsonb);
  v_existing := coalesce(v_profile_state -> 'hiddenChannels', '[]'::jsonb);
  v_profile_state := v_profile_state || jsonb_build_object('hiddenChannels', p_hidden_channels);
  v_iptv_by_profile := v_iptv_by_profile || jsonb_build_object(v_profile_id, v_profile_state);
  v_updated_at := greatest(
    coalesce((v_payload ->> 'updatedAt')::bigint, 0) + 1,
    (extract(epoch from clock_timestamp()) * 1000)::bigint
  );
  v_payload := v_payload || jsonb_build_object(
    'iptvByProfile', v_iptv_by_profile,
    'updatedAt', v_updated_at,
    'userId', v_uid::text,
    'version', greatest(coalesce((v_payload ->> 'version')::integer, 1), 2)
  );

  insert into public.account_sync_state (user_id, payload, updated_at)
  values (v_uid, v_payload::text, now())
  on conflict (user_id) do update
    set payload = excluded.payload, updated_at = excluded.updated_at;

  return jsonb_build_object(
    'profile_id', v_profile_id,
    'hidden_count', jsonb_array_length(p_hidden_channels),
    'updated_at', v_updated_at,
    'previous_count', jsonb_array_length(v_existing)
  );
end;
$$;

revoke all on function public.megacompanion_patch_iptv_hidden_channels(text, jsonb) from public, anon, authenticated;
grant execute on function public.megacompanion_patch_iptv_hidden_channels(text, jsonb) to authenticated;

-- ── 3) Patch playlists : cascade prefs + tombstones 7 jours ─────────────────
-- Quand une liste est retirée :
--   - ses prefs embarquées disparaissent avec l’entrée playlists[]
--   - prefsByPlaylistId[id] + agrégats profil (favorites / hidden*) liés sont retirés de l’état actif
--   - tombstone deletedIptvPlaylists[id] = { deletedAt, prefs } pour purge dure à J+7
-- Android ignore les clés inconnues (forward-compat).

create or replace function public.megacompanion_patch_iptv_playlists(
  p_profile_id text,
  p_playlists jsonb
)
returns jsonb
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid := auth.uid();
  v_profile_id text := nullif(trim(p_profile_id), '');
  v_payload jsonb;
  v_iptv_by_profile jsonb;
  v_profile_state jsonb;
  v_existing_playlists jsonb;
  v_primary jsonb;
  v_m3u text := '';
  v_epg text := '';
  v_updated_at bigint;
  v_active_profile text;
  v_now_ms bigint;
  v_ttl_ms bigint := 7 * 24 * 60 * 60 * 1000;
  v_deleted jsonb := '{}'::jsonb;
  v_prefs_by jsonb := '{}'::jsonb;
  v_old_id text;
  v_new_ids text[];
  v_old_ids text[];
  v_removed text;
  v_kept_prefs jsonb;
  v_tombstone_key text;
  v_tombstone jsonb;
  v_deleted_at bigint;
  v_removed_count int := 0;
  v_purged_count int := 0;
begin
  if v_uid is null then
    raise exception 'authenticated user required' using errcode = '28000';
  end if;
  if v_profile_id is null then
    raise exception 'profile_id required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.user_profiles up
    where up.user_id = v_uid and up.id = v_profile_id
  ) then
    raise exception 'profile not found' using errcode = '42501';
  end if;
  if jsonb_typeof(p_playlists) is distinct from 'array' then
    raise exception 'playlists must be a JSON array' using errcode = '22023';
  end if;

  select coalesce(ass.payload::jsonb, '{}'::jsonb)
  into v_payload
  from public.account_sync_state ass
  where ass.user_id = v_uid
  for update;

  if not found then
    v_payload := jsonb_build_object('version', 2, 'userId', v_uid::text);
  end if;

  v_now_ms := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  v_iptv_by_profile := coalesce(v_payload -> 'iptvByProfile', '{}'::jsonb);
  v_profile_state := coalesce(v_iptv_by_profile -> v_profile_id, '{}'::jsonb);
  v_existing_playlists := coalesce(v_profile_state -> 'playlists', '[]'::jsonb);

  if jsonb_array_length(p_playlists) = 0 and jsonb_array_length(v_existing_playlists) > 0 then
    raise exception 'refusing to push empty playlist list' using errcode = '22023';
  end if;

  select coalesce(array_agg(nullif(trim(elem ->> 'id'), '')), array[]::text[])
  into v_new_ids
  from jsonb_array_elements(p_playlists) elem;

  select coalesce(array_agg(nullif(trim(elem ->> 'id'), '')), array[]::text[])
  into v_old_ids
  from jsonb_array_elements(v_existing_playlists) elem;

  v_deleted := coalesce(v_profile_state -> 'deletedIptvPlaylists', '{}'::jsonb);
  if jsonb_typeof(v_deleted) is distinct from 'object' then
    v_deleted := '{}'::jsonb;
  end if;
  v_prefs_by := coalesce(v_profile_state -> 'prefsByPlaylistId', '{}'::jsonb);
  if jsonb_typeof(v_prefs_by) is distinct from 'object' then
    v_prefs_by := '{}'::jsonb;
  end if;

  -- Purge dure des tombstones > 7 jours
  for v_tombstone_key, v_tombstone in
    select key, value from jsonb_each(v_deleted)
  loop
    v_deleted_at := coalesce((v_tombstone ->> 'deletedAt')::bigint, 0);
    if v_deleted_at > 0 and (v_now_ms - v_deleted_at) >= v_ttl_ms then
      v_deleted := v_deleted - v_tombstone_key;
      v_purged_count := v_purged_count + 1;
    end if;
  end loop;

  -- Listes retirées → tombstone + retrait prefs actives
  if v_old_ids is not null then
    foreach v_removed in array v_old_ids
    loop
      if v_removed is null or v_removed = any (v_new_ids) then
        continue;
      end if;
      v_removed_count := v_removed_count + 1;
      v_kept_prefs := coalesce(v_prefs_by -> v_removed, '{}'::jsonb);
      -- Extraire aussi hiddenCategories de l’entrée playlist elle-même
      select coalesce(elem, '{}'::jsonb)
      into v_tombstone
      from jsonb_array_elements(v_existing_playlists) elem
      where nullif(trim(elem ->> 'id'), '') = v_removed
      limit 1;
      if v_tombstone is not null then
        v_kept_prefs := v_kept_prefs || jsonb_build_object(
          'hiddenCategories', coalesce(v_tombstone -> 'hiddenCategories', '[]'::jsonb),
          'm3uUrl', coalesce(v_tombstone ->> 'm3uUrl', '')
        );
      end if;
      v_deleted := v_deleted || jsonb_build_object(
        v_removed,
        jsonb_build_object(
          'deletedAt', v_now_ms,
          'prefs', v_kept_prefs
        )
      );
      v_prefs_by := v_prefs_by - v_removed;
    end loop;
  end if;

  v_profile_state := v_profile_state || jsonb_build_object('playlists', p_playlists);

  -- Si au moins une liste a été retirée : retirer les agrégats profil (favoris / masquages)
  -- qui n’ont plus de source active (évite les résidus après tests de listes).
  if v_removed_count > 0 then
    v_profile_state := v_profile_state
      || jsonb_build_object(
        'favoriteChannels', '[]'::jsonb,
        'hiddenChannels', '[]'::jsonb,
        'hiddenCategories', '[]'::jsonb,
        'hiddenGroups', '[]'::jsonb
      );
  end if;

  v_profile_state := v_profile_state || jsonb_build_object(
    'deletedIptvPlaylists', v_deleted,
    'prefsByPlaylistId', v_prefs_by
  );

  select elem
  into v_primary
  from jsonb_array_elements(p_playlists) elem
  where coalesce((elem ->> 'enabled')::boolean, true)
    and nullif(trim(elem ->> 'm3uUrl'), '') is not null
  limit 1;

  if v_primary is null and jsonb_array_length(p_playlists) > 0 then
    select elem into v_primary from jsonb_array_elements(p_playlists) elem limit 1;
  end if;

  if v_primary is not null then
    v_m3u := coalesce(nullif(trim(v_primary ->> 'm3uUrl'), ''), coalesce(v_profile_state ->> 'm3uUrl', ''));
    v_epg := coalesce(nullif(trim(v_primary ->> 'epgUrl'), ''), coalesce(v_profile_state ->> 'epgUrl', ''));
    v_profile_state := v_profile_state || jsonb_build_object('m3uUrl', v_m3u, 'epgUrl', v_epg);
  end if;

  v_iptv_by_profile := v_iptv_by_profile || jsonb_build_object(v_profile_id, v_profile_state);
  v_updated_at := greatest(
    coalesce((v_payload ->> 'updatedAt')::bigint, 0) + 1,
    v_now_ms
  );

  v_payload := v_payload || jsonb_build_object(
    'iptvByProfile', v_iptv_by_profile,
    'updatedAt', v_updated_at,
    'userId', v_uid::text,
    'version', greatest(coalesce((v_payload ->> 'version')::integer, 1), 2)
  );

  v_active_profile := nullif(trim(v_payload ->> 'activeProfileId'), '');
  if v_active_profile = v_profile_id and v_primary is not null then
    v_payload := v_payload || jsonb_build_object('iptvM3uUrl', v_m3u, 'iptvEpgUrl', v_epg);
  end if;

  insert into public.account_sync_state (user_id, payload, updated_at)
  values (v_uid, v_payload::text, now())
  on conflict (user_id) do update
    set payload = excluded.payload, updated_at = excluded.updated_at;

  return jsonb_build_object(
    'profile_id', v_profile_id,
    'playlist_count', jsonb_array_length(p_playlists),
    'updated_at', v_updated_at,
    'removed_playlist_count', v_removed_count,
    'purged_tombstone_count', v_purged_count
  );
end;
$$;

revoke all on function public.megacompanion_patch_iptv_playlists(text, jsonb) from public, anon, authenticated;
grant execute on function public.megacompanion_patch_iptv_playlists(text, jsonb) to authenticated;
