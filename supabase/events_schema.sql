create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  location text not null default '',
  category text not null default 'General',
  micro_event boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  event_id text not null references public.events(id) on delete cascade,
  user_id text not null,
  status text not null check (status in ('yes', 'maybe', 'no')),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

drop policy if exists "events_read" on public.events;
create policy "events_read"
  on public.events
  for select
  using (true);

drop policy if exists "event_rsvps_read" on public.event_rsvps;
create policy "event_rsvps_read"
  on public.event_rsvps
  for select
  using (true);

drop policy if exists "event_rsvps_write" on public.event_rsvps;
create policy "event_rsvps_write"
  on public.event_rsvps
  for insert
  with check (true);

drop policy if exists "event_rsvps_update" on public.event_rsvps;
create policy "event_rsvps_update"
  on public.event_rsvps
  for update
  using (true)
  with check (true);

insert into public.events (id, title, description, starts_at, location, category, micro_event)
values
  (
    'evt-1',
    'Moonlight Tea Circle',
    'Gentle evening sharing and wind-down ritual with herbal tea.',
    now() + interval '20 hours',
    'Lake House Studio',
    'Wellness',
    false
  ),
  (
    'evt-2',
    '10-Minute Desk Reset',
    'Micro stretch and breath break for everyone online.',
    now() + interval '28 hours',
    'Village Room A',
    'Micro-Event',
    true
  ),
  (
    'evt-3',
    'Blue Hour Networking Mixer',
    'Casual connection session and quick intros with prompts.',
    now() + interval '50 hours',
    'Rooftop Deck',
    'Networking',
    false
  )
on conflict (id) do nothing;
