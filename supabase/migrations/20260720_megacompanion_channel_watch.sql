-- MegaCompagnon : temps de visionnage IPTV par chaîne (batch, Free Tier friendly)
-- Appliquer via MCP Supabase / CLI. RLS : user_id = auth.uid().

create table if not exists public.megacompanion_channel_watch (
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_id text not null,
  channel_id text not null,
  channel_name text,
  logo_url text,
  watch_seconds integer not null default 0 check (watch_seconds >= 0),
  last_watched_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, profile_id, channel_id)
);

create index if not exists megacompanion_channel_watch_user_profile_seconds_idx
  on public.megacompanion_channel_watch (user_id, profile_id, watch_seconds desc);

alter table public.megacompanion_channel_watch enable row level security;

drop policy if exists megacompanion_channel_watch_select_own on public.megacompanion_channel_watch;
create policy megacompanion_channel_watch_select_own
  on public.megacompanion_channel_watch for select
  using (auth.uid() = user_id);

drop policy if exists megacompanion_channel_watch_insert_own on public.megacompanion_channel_watch;
create policy megacompanion_channel_watch_insert_own
  on public.megacompanion_channel_watch for insert
  with check (auth.uid() = user_id);

drop policy if exists megacompanion_channel_watch_update_own on public.megacompanion_channel_watch;
create policy megacompanion_channel_watch_update_own
  on public.megacompanion_channel_watch for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Batch upsert : un seul round-trip pour N chaînes (anti-spam Free Tier)
create or replace function public.megacompanion_upsert_channel_watch_batch(
  p_profile_id text,
  p_rows jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n integer := 0;
  r jsonb;
  cid text;
  add_sec integer;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_profile_id is null or length(trim(p_profile_id)) = 0 then
    raise exception 'profile_required';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    return 0;
  end if;

  -- Refuse wipe : tableau vide n'efface rien
  if jsonb_array_length(p_rows) = 0 then
    return 0;
  end if;

  for r in select * from jsonb_array_elements(p_rows)
  loop
    cid := nullif(trim(coalesce(r->>'channel_id', '')), '');
    if cid is null then
      continue;
    end if;
    add_sec := greatest(0, coalesce((r->>'watch_seconds')::integer, 0));
    if add_sec <= 0 and coalesce(r->>'absolute', 'false') <> 'true' then
      continue;
    end if;

    insert into public.megacompanion_channel_watch as t (
      user_id, profile_id, channel_id, channel_name, logo_url, watch_seconds, last_watched_at, updated_at
    ) values (
      uid,
      trim(p_profile_id),
      cid,
      nullif(trim(coalesce(r->>'channel_name', '')), ''),
      nullif(trim(coalesce(r->>'logo_url', '')), ''),
      case when coalesce(r->>'absolute', 'false') = 'true' then add_sec else add_sec end,
      coalesce((r->>'last_watched_at')::timestamptz, now()),
      now()
    )
    on conflict (user_id, profile_id, channel_id) do update set
      channel_name = coalesce(excluded.channel_name, t.channel_name),
      logo_url = coalesce(excluded.logo_url, t.logo_url),
      watch_seconds = case
        when coalesce(r->>'absolute', 'false') = 'true' then excluded.watch_seconds
        else t.watch_seconds + excluded.watch_seconds
      end,
      last_watched_at = greatest(t.last_watched_at, excluded.last_watched_at),
      updated_at = now();

    n := n + 1;
  end loop;

  return n;
end;
$$;

revoke all on function public.megacompanion_upsert_channel_watch_batch(text, jsonb) from public;
grant execute on function public.megacompanion_upsert_channel_watch_batch(text, jsonb) to authenticated;
