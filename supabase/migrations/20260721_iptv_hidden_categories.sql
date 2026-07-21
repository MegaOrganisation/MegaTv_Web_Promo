-- MegaCompagnon : patch batch catégories IPTV masquées (profil-scopé, anti-wipe)
-- Miroir de megacompanion_patch_iptv_favorites → iptvByProfile[profileId].hiddenCategories

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
    select 1
    from public.user_profiles up
    where up.user_id = v_uid
      and up.id = v_profile_id
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

  -- Anti-wipe soft : autorise liste vide (démasquer tout) — contrairement aux favoris.
  -- Les catégories masquées sont une préférence UX, pas une liste critique.

  v_profile_state := v_profile_state || jsonb_build_object('hiddenCategories', p_hidden_categories);
  v_iptv_by_profile := v_iptv_by_profile || jsonb_build_object(v_profile_id, v_profile_state);

  v_updated_at := greatest(
    coalesce((v_payload ->> 'updatedAt')::bigint, 0) + 1,
    (extract(epoch from clock_timestamp()) * 1000)::bigint
  );

  v_payload := v_payload
    || jsonb_build_object(
      'iptvByProfile', v_iptv_by_profile,
      'updatedAt', v_updated_at,
      'userId', v_uid::text,
      'version', greatest(coalesce((v_payload ->> 'version')::integer, 1), 2)
    );

  insert into public.account_sync_state (user_id, payload, updated_at)
  values (v_uid, v_payload::text, now())
  on conflict (user_id) do update
    set payload = excluded.payload,
        updated_at = excluded.updated_at;

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
