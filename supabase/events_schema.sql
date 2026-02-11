-- Non-destructive migration for existing Ctrl+Chill schema.
-- Safe to run multiple times.

-- Ensure events.created_by is populated for host ownership checks.
alter table public.events
  add column if not exists created_by uuid;

update public.events
set created_by = auth.uid()
where created_by is null and auth.uid() is not null;

-- Ensure event type supports values used by UI mapping.
-- (Existing constraint already allows gratitude/co-working/circle in your schema.)

-- Optional but recommended: one RSVP per user per event.
create unique index if not exists rsvps_user_event_unique
  on public.rsvps (user_id, event_id);

-- Helpful indexes for listing.
create index if not exists events_community_start_idx
  on public.events (community_id, start_at);

create index if not exists rsvps_event_idx
  on public.rsvps (event_id);
