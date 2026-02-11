-- Run this in Supabase SQL editor.
-- It is idempotent where possible.

create extension if not exists "uuid-ossp";

-- Storage bucket for profile avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Profiles: fields used by profile page
alter table public.profiles
  add column if not exists email text,
  add column if not exists membership_since timestamptz default now(),
  add column if not exists membership_tier text default 'Active Member',
  add column if not exists trusted_contact_name text,
  add column if not exists trusted_contact_phone text,
  add column if not exists notification_events boolean not null default true,
  add column if not exists notification_village boolean not null default true,
  add column if not exists notification_push boolean not null default false,
  add column if not exists dark_mode boolean not null default false,
  add column if not exists data_visibility text not null default 'friends';

alter table public.profiles
  drop constraint if exists profiles_data_visibility_check;

alter table public.profiles
  add constraint profiles_data_visibility_check
  check (data_visibility in ('everyone', 'friends', 'private'));

-- Membership shape and consistency
alter table public.memberships
  alter column community_id set not null;

alter table public.memberships
  drop constraint if exists memberships_user_id_fkey;

alter table public.memberships
  add constraint memberships_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.memberships
  drop constraint if exists memberships_role_check;

alter table public.memberships
  add constraint memberships_role_check
  check (role in ('member', 'moderator', 'admin'));

create unique index if not exists memberships_user_community_unique
  on public.memberships (user_id, community_id);

-- Optional: keep RSVP ordering/querying simple
alter table public.rsvps
  add column if not exists created_at timestamptz not null default now();

-- RLS
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (id = auth.uid());

drop policy if exists "memberships_select_own" on public.memberships;
create policy "memberships_select_own"
  on public.memberships
  for select
  using (user_id = auth.uid());

-- Storage policies: each user can manage files in their own folder.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Auto-create profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lantern String schema
create extension if not exists pgcrypto;

create table if not exists public.lanterns (
  id uuid primary key default gen_random_uuid(),
  mood_id text not null check (mood_id in ('cozy', 'anxious', 'focused', 'low-energy', 'social')),
  content text not null check (char_length(content) between 1 and 80),
  author text,
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  lantern_id uuid not null references public.lanterns(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 80),
  created_at timestamptz not null default now()
);

create index if not exists lanterns_created_at_idx on public.lanterns (created_at desc);
create index if not exists replies_lantern_id_idx on public.replies (lantern_id);

alter table public.lanterns enable row level security;
alter table public.replies enable row level security;

drop policy if exists "lanterns_read_all" on public.lanterns;
create policy "lanterns_read_all"
  on public.lanterns
  for select
  using (true);

drop policy if exists "lanterns_insert_all" on public.lanterns;
create policy "lanterns_insert_all"
  on public.lanterns
  for insert
  with check (true);

drop policy if exists "replies_read_all" on public.replies;
create policy "replies_read_all"
  on public.replies
  for select
  using (true);

drop policy if exists "replies_insert_all" on public.replies;
create policy "replies_insert_all"
  on public.replies
  for insert
  with check (true);
