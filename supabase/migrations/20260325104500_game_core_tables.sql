create extension if not exists pgcrypto;

create table if not exists public.game_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level integer not null default 1,
  xp integer not null default 0,
  hp integer not null default 100,
  mp integer not null default 50,
  tokens integer not null default 0,
  realm text not null default 'hub',
  position_x integer not null default 320,
  position_y integer not null default 240,
  costume_id text not null default 'default',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_quests (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text not null,
  target_type text not null,
  reward_xp integer not null default 0,
  reward_tokens integer not null default 0,
  realm text not null default 'hub',
  is_repeatable boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.game_quest_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id uuid not null references public.game_quests(id) on delete cascade,
  progress integer not null default 0,
  completed boolean not null default false,
  claimed boolean not null default false,
  completed_at timestamptz,
  claimed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, quest_id)
);

create table if not exists public.game_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  room_id text not null,
  room_type text not null default 'hub',
  realm text not null default 'hub',
  position_x integer not null default 320,
  position_y integer not null default 240,
  direction text not null default 'down',
  is_online boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists idx_game_profiles_level on public.game_profiles(level desc);
create index if not exists idx_game_quests_realm on public.game_quests(realm);
create index if not exists idx_game_quest_progress_user on public.game_quest_progress(user_id, completed, claimed);
create index if not exists idx_game_sessions_room on public.game_sessions(room_type, realm, is_online);

alter table public.game_profiles enable row level security;
alter table public.game_quests enable row level security;
alter table public.game_quest_progress enable row level security;
alter table public.game_sessions enable row level security;

drop policy if exists "game_profiles_select_own" on public.game_profiles;
create policy "game_profiles_select_own"
on public.game_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "game_profiles_update_own" on public.game_profiles;
create policy "game_profiles_update_own"
on public.game_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "game_profiles_insert_own" on public.game_profiles;
create policy "game_profiles_insert_own"
on public.game_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "game_quests_select_active" on public.game_quests;
create policy "game_quests_select_active"
on public.game_quests
for select
to authenticated
using (is_active = true);

drop policy if exists "game_quest_progress_select_own" on public.game_quest_progress;
create policy "game_quest_progress_select_own"
on public.game_quest_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "game_quest_progress_insert_own" on public.game_quest_progress;
create policy "game_quest_progress_insert_own"
on public.game_quest_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "game_quest_progress_update_own" on public.game_quest_progress;
create policy "game_quest_progress_update_own"
on public.game_quest_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "game_sessions_select_own" on public.game_sessions;
create policy "game_sessions_select_own"
on public.game_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "game_sessions_insert_own" on public.game_sessions;
create policy "game_sessions_insert_own"
on public.game_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "game_sessions_update_own" on public.game_sessions;
create policy "game_sessions_update_own"
on public.game_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.init_game_profile()
returns public.game_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  profile_row public.game_profiles;
begin
  if current_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.game_profiles (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

  select *
  into profile_row
  from public.game_profiles
  where user_id = current_user_id;

  return profile_row;
end;
$$;

grant execute on function public.init_game_profile() to authenticated;

insert into public.game_quests (slug, title, description, target_type, reward_xp, reward_tokens, realm, is_repeatable, metadata)
values
  (
    'first_aion_chat',
    'Whisper From The Orb',
    'Open AION and begin a conversation about your next step.',
    'chat',
    50,
    10,
    'hub',
    false,
    '{"source":"seed","domain":"mindos"}'::jsonb
  ),
  (
    'first_assessment',
    'Enter The First Realm',
    'Complete your first domain assessment to unlock the next layer of guidance.',
    'assessment',
    125,
    20,
    'hub',
    false,
    '{"source":"seed","domain":"strategy"}'::jsonb
  ),
  (
    'daily_focus_streak',
    'Temple Of Focus',
    'Complete one focus-oriented action to maintain momentum.',
    'daily_action',
    30,
    5,
    'focus',
    true,
    '{"source":"seed","domain":"focus"}'::jsonb
  )
on conflict (slug) do nothing;
