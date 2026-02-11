import { createClient } from "@supabase/supabase-js";

import type { EventItem, RSVPStatus } from "@/lib/events-types";

type MemoryEvent = Omit<EventItem, "userRsvp" | "rsvpCounts" | "rsvpMembers"> & {
  userStatuses: Record<string, RSVPStatus>;
};
type CreateEventInput = {
  title: string;
  description: string;
  startsAt: string;
  location: string;
  category: string;
  microEvent: boolean;
  createdBy: string;
};
type UpdateEventInput = Partial<CreateEventInput>;

const seedEvents: MemoryEvent[] = [
  {
    id: "evt-1",
    title: "Moonlight Tea Circle",
    description: "Gentle evening sharing and wind-down ritual with herbal tea.",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    location: "Lake House Studio",
    category: "Wellness",
    microEvent: false,
    createdBy: "ember",
    userStatuses: { ember: "yes", noah: "yes", raya: "maybe", liam: "no" },
  },
  {
    id: "evt-2",
    title: "10-Minute Desk Reset",
    description: "Micro stretch and breath break for everyone online.",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    location: "Village Room A",
    category: "Micro-Event",
    microEvent: true,
    createdBy: "noah",
    userStatuses: { ember: "yes", noah: "maybe", zane: "yes" },
  },
  {
    id: "evt-3",
    title: "Blue Hour Networking Mixer",
    description: "Casual connection session and quick intros with prompts.",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(),
    location: "Rooftop Deck",
    category: "Networking",
    microEvent: false,
    createdBy: "tara",
    userStatuses: { tara: "yes", noah: "maybe", mina: "yes", oliver: "no" },
  },
  {
    id: "evt-4",
    title: "Gratitude Wall Sprint",
    description: "A short co-writing sprint to post gratitude notes.",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 54).toISOString(),
    location: "Community Lounge",
    category: "Micro-Event",
    microEvent: true,
    createdBy: "mina",
    userStatuses: { tara: "maybe", mina: "yes" },
  },
];

const memoryEvents = new Map(seedEvents.map((event) => [event.id, event]));

type SupabaseClient = ReturnType<typeof createClient<any>> | null;

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createClient<any>(url, key, { auth: { persistSession: false } });
}

function toEventItem(event: MemoryEvent, userId: string): EventItem {
  const counts: Record<RSVPStatus, number> = { yes: 0, maybe: 0, no: 0 };
  const members: Record<RSVPStatus, string[]> = { yes: [], maybe: [], no: [] };
  Object.values(event.userStatuses).forEach((status) => {
    counts[status] += 1;
  });
  Object.entries(event.userStatuses).forEach(([member, status]) => {
    members[status].push(member);
  });

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startsAt: event.startsAt,
    location: event.location,
    category: event.category,
    microEvent: event.microEvent,
    createdBy: event.createdBy,
    rsvpCounts: counts,
    rsvpMembers: members,
    userRsvp: event.userStatuses[userId] ?? null,
  };
}

function sortByDateAsc(a: { startsAt: string }, b: { startsAt: string }) {
  return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
}

function isRSVPStatus(value: unknown): value is RSVPStatus {
  return value === "yes" || value === "maybe" || value === "no";
}

export async function listEvents(userId: string): Promise<{ source: "supabase" | "memory"; events: EventItem[] }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: eventRows, error: eventsError } = await supabase
      .from("events")
      .select("id,title,description,starts_at,location,category,micro_event")
      .order("starts_at", { ascending: true });

    if (!eventsError && eventRows) {
      const eventIds = eventRows.map((event) => event.id);
      const { data: allRsvps, error: rsvpError } = await supabase
        .from("event_rsvps")
        .select("event_id,user_id,status")
        .in("event_id", eventIds);

      if (!rsvpError && allRsvps) {
        const rows = eventRows.map((event) => {
          const counts: Record<RSVPStatus, number> = { yes: 0, maybe: 0, no: 0 };
          const members: Record<RSVPStatus, string[]> = { yes: [], maybe: [], no: [] };
          let userRsvp: RSVPStatus | null = null;

          allRsvps
            .filter((rsvp) => rsvp.event_id === event.id)
            .forEach((rsvp) => {
              if (isRSVPStatus(rsvp.status)) {
                counts[rsvp.status] += 1;
                members[rsvp.status].push(String(rsvp.user_id));
                if (rsvp.user_id === userId) {
                  userRsvp = rsvp.status;
                }
              }
            });

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            startsAt: event.starts_at,
            location: event.location,
            category: event.category,
            microEvent: event.micro_event,
            createdBy: "community-team",
            rsvpCounts: counts,
            rsvpMembers: members,
            userRsvp,
          } satisfies EventItem;
        });

        return { source: "supabase", events: rows };
      }
    }
  }

  const events = Array.from(memoryEvents.values())
    .map((event) => toEventItem(event, userId))
    .sort(sortByDateAsc);
  return { source: "memory", events };
}

export async function setEventRsvp(
  userId: string,
  eventId: string,
  status: RSVPStatus
): Promise<{ source: "supabase" | "memory"; event: EventItem | null }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error: upsertError } = await supabase.from("event_rsvps").upsert(
      {
        event_id: eventId,
        user_id: userId,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    );

    if (!upsertError) {
      const { events } = await listEvents(userId);
      const event = events.find((item) => item.id === eventId) ?? null;
      return { source: "supabase", event };
    }
  }

  const event = memoryEvents.get(eventId);
  if (!event) {
    return { source: "memory", event: null };
  }
  event.userStatuses[userId] = status;
  return { source: "memory", event: toEventItem(event, userId) };
}

export async function createEvent(
  userId: string,
  input: CreateEventInput
): Promise<{ source: "supabase" | "memory"; event: EventItem }> {
  const id =
    globalThis.crypto?.randomUUID?.() ?? `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("events")
      .insert({
        id,
        title: input.title,
        description: input.description,
        starts_at: input.startsAt,
        location: input.location,
        category: input.category,
        micro_event: input.microEvent,
      })
      .select("id,title,description,starts_at,location,category,micro_event")
      .single();

    if (!error && data) {
      return {
        source: "supabase",
        event: {
          id: data.id,
          title: data.title,
          description: data.description,
          startsAt: data.starts_at,
          location: data.location,
          category: data.category,
          microEvent: data.micro_event,
          createdBy: input.createdBy,
          rsvpCounts: { yes: 0, maybe: 0, no: 0 },
          rsvpMembers: { yes: [], maybe: [], no: [] },
          userRsvp: null,
        },
      };
    }
  }

  const memoryEvent: MemoryEvent = {
    id,
    title: input.title,
    description: input.description,
    startsAt: input.startsAt,
    location: input.location,
    category: input.category,
    microEvent: input.microEvent,
    createdBy: input.createdBy,
    userStatuses: {},
  };
  memoryEvents.set(memoryEvent.id, memoryEvent);
  return { source: "memory", event: toEventItem(memoryEvent, userId) };
}

export async function updateEvent(
  userId: string,
  eventId: string,
  input: UpdateEventInput
): Promise<{ source: "supabase" | "memory"; event: EventItem | null }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const updates: Record<string, unknown> = {};
    if (typeof input.title === "string") updates.title = input.title;
    if (typeof input.description === "string") updates.description = input.description;
    if (typeof input.startsAt === "string") updates.starts_at = input.startsAt;
    if (typeof input.location === "string") updates.location = input.location;
    if (typeof input.category === "string") updates.category = input.category;
    if (typeof input.microEvent === "boolean") updates.micro_event = input.microEvent;

    const { error } = await supabase.from("events").update(updates).eq("id", eventId);
    if (!error) {
      const { events } = await listEvents(userId);
      const updated = events.find((item) => item.id === eventId) ?? null;
      return { source: "supabase", event: updated };
    }
  }

  const event = memoryEvents.get(eventId);
  if (!event) return { source: "memory", event: null };

  event.title = input.title ?? event.title;
  event.description = input.description ?? event.description;
  event.startsAt = input.startsAt ?? event.startsAt;
  event.location = input.location ?? event.location;
  event.category = input.category ?? event.category;
  event.microEvent = input.microEvent ?? event.microEvent;
  return { source: "memory", event: toEventItem(event, userId) };
}

export async function deleteEvent(
  userId: string,
  eventId: string
): Promise<{ source: "supabase" | "memory"; deleted: boolean }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (!error) return { source: "supabase", deleted: true };
  }

  const existed = memoryEvents.delete(eventId);
  return { source: "memory", deleted: existed };
}
