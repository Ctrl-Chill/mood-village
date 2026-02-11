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
