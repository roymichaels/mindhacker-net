create table if not exists public.user_story_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_chapter text not null default 'chapter_mindos',
  language text not null default 'en',
  theme_params jsonb not null default '{}'::jsonb,
  identity_summary jsonb not null default '{}'::jsonb,
  last_scene_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_story_scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scene_id text not null unique,
  chapter_key text not null,
  scene_type text not null,
  headline text not null,
  body text not null,
  image_url text not null,
  theme jsonb not null default '{}'::jsonb,
  ambient_props jsonb not null default '{}'::jsonb,
  personalization_source jsonb not null default '{}'::jsonb,
  cache_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_story_beats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  beat_key text not null,
  beat_type text not null,
  source_table text,
  source_id text,
  payload jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, beat_key)
);

create index if not exists idx_user_story_scenes_user_id on public.user_story_scenes(user_id);
create index if not exists idx_user_story_scenes_cache_key on public.user_story_scenes(cache_key);
create index if not exists idx_user_story_beats_user_id on public.user_story_beats(user_id);

alter table public.user_story_profiles enable row level security;
alter table public.user_story_scenes enable row level security;
alter table public.user_story_beats enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_story_profiles' and policyname = 'Users can view their story profile'
  ) then
    create policy "Users can view their story profile"
    on public.user_story_profiles
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_story_profiles' and policyname = 'Users can insert their story profile'
  ) then
    create policy "Users can insert their story profile"
    on public.user_story_profiles
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_story_profiles' and policyname = 'Users can update their story profile'
  ) then
    create policy "Users can update their story profile"
    on public.user_story_profiles
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_story_scenes' and policyname = 'Users can view their story scenes'
  ) then
    create policy "Users can view their story scenes"
    on public.user_story_scenes
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_story_beats' and policyname = 'Users can view their story beats'
  ) then
    create policy "Users can view their story beats"
    on public.user_story_beats
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_story_beats' and policyname = 'Users can insert their story beats'
  ) then
    create policy "Users can insert their story beats"
    on public.user_story_beats
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_story_beats' and policyname = 'Users can update their story beats'
  ) then
    create policy "Users can update their story beats"
    on public.user_story_beats
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.set_story_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_story_profiles_updated_at on public.user_story_profiles;
create trigger trg_user_story_profiles_updated_at
before update on public.user_story_profiles
for each row execute function public.set_story_updated_at();

drop trigger if exists trg_user_story_scenes_updated_at on public.user_story_scenes;
create trigger trg_user_story_scenes_updated_at
before update on public.user_story_scenes
for each row execute function public.set_story_updated_at();

drop trigger if exists trg_user_story_beats_updated_at on public.user_story_beats;
create trigger trg_user_story_beats_updated_at
before update on public.user_story_beats
for each row execute function public.set_story_updated_at();

insert into storage.buckets (id, name, public)
select 'story-scenes', 'story-scenes', true
where not exists (
  select 1 from storage.buckets where id = 'story-scenes'
);

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can read story scene assets'
  ) then
    create policy "Public can read story scene assets"
    on storage.objects
    for select
    to public
    using (bucket_id = 'story-scenes');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Service role can manage story scene assets'
  ) then
    create policy "Service role can manage story scene assets"
    on storage.objects
    for all
    to service_role
    using (bucket_id = 'story-scenes')
    with check (bucket_id = 'story-scenes');
  end if;
end $$;
