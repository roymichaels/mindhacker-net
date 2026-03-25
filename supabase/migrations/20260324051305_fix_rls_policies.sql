-- Fix RLS policies for public data access
-- Allows public reads on theme/settings/practitioners
-- Allows analytics inserts

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'site_settings' and policyname = 'Allow public read on site_settings'
  ) then
    create policy "Allow public read on site_settings"
      on public.site_settings for select to public using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'theme_settings' and policyname = 'Allow public read on theme_settings'
  ) then
    create policy "Allow public read on theme_settings"
      on public.theme_settings for select to public using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'practitioners' and policyname = 'Allow public read on practitioners'
  ) then
    create policy "Allow public read on practitioners"
      on public.practitioners for select to public using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'visitor_sessions' and policyname = 'Allow visitor_sessions insert'
  ) then
    create policy "Allow visitor_sessions insert"
      on public.visitor_sessions for insert to public with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'page_views' and policyname = 'Allow page_views insert'
  ) then
    create policy "Allow page_views insert"
      on public.page_views for insert to public with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Allow authenticated read profiles'
  ) then
    create policy "Allow authenticated read profiles"
      on public.profiles for select to authenticated using (true);
  end if;
end $$;
