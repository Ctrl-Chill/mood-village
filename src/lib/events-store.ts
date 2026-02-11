import type { SupabaseClient } from "@supabase/supabase-js";

import type { EventItem, RSVPStatus } from "@/lib/events-types";

type SupabaseLikeClient = SupabaseClient;

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
};

type UpdateEventInput = Partial<CreateEventInput>;

type EventRow = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  location: string;
  category: string;
  micro_event: boolean;
  created_by: string | null;
};

type EventRsvpRow = {
  event_id: string;
  user_id: string;
  status: string;
};

const memoryEvents = new Map<string, MemoryEvent>();

function toEventItem(event: MemoryEvent, userId: string | null): EventItem {
  const counts: Record<RSVPStatus, number> = { yes: 0, maybe: 0, no: 0 };
  const members: Record<RSVPStatus, string[]> = { yes: [], maybe: [], no: [] };

  Object.entries(event.userStatuses).forEach(([member, status]) => {
    counts[status] += 1;
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
    userRsvp: userId ? event.userStatuses[userId] ?? null : null,
  };
}

function sortByDateAsc(a: { startsAt: string }, b: { startsAt: string }) {
  return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
}

function isRSVPStatus(value: unknown): value is RSVPStatus {
  return value === "yes" || value === "maybe" || value === "no";
}

export async function listEvents(
  userId: string | null,
  supabase: SupabaseLikeClient | null
): Promise<{ source: "supabase" | "memory"; events: EventItem[] }> {
  if (supabase) {
    const { data: eventRows, error: eventsError } = await supabase
      .from("events")
      .select("id,title,description,starts_at,location,category,micro_event,created_by")
      .order("starts_at", { ascending: true });

    if (!eventsError && eventRows) {
      const typedEventRows = eventRows as EventRow[];
      const eventIds = typedEventRows.map((event) => event.id);
      const allRsvps =
        eventIds.length > 0
          ? (
              await supabase
                .from("event_rsvps")
                .select("event_id,user_id,status")
                .in("event_id", eventIds)
            ).data ?? ([] as EventRsvpRow[])
          : [];

      const typedRsvps = allRsvps as EventRsvpRow[];
      const rows = typedEventRows.map((event) => {
        const counts: Record<RSVPStatus, number> = { yes: 0, maybe: 0, no: 0 };
        const members: Record<RSVPStatus, string[]> = { yes: [], maybe: [], no: [] };
        let userRsvp: RSVPStatus | null = null;

        typedRsvps
          .filter((rsvp) => rsvp.event_id === event.id)
          .forEach((rsvp) => {
            if (isRSVPStatus(rsvp.status)) {
              counts[rsvp.status] += 1;
              members[rsvp.status].push(String(rsvp.user_id));
              if (userId && rsvp.user_id === userId) {
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
          createdBy: event.created_by ?? "community-team",
          rsvpCounts: counts,
          rsvpMembers: members,
          userRsvp,
        } satisfies EventItem;
      });

      return { source: "supabase", events: rows };
    }
  }

  const events = Array.from(memoryEvents.values()).map((event) => toEventItem(event, userId)).sort(sortByDateAsc);
  return { source: "memory", events };
}

export async function setEventRsvp(
  userId: string,
  eventId: string,
  status: RSVPStatus,
  supabase: SupabaseLikeClient | null
): Promise<{ source: "supabase" | "memory"; event: EventItem | null }> {
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
      const { events } = await listEvents(userId, supabase);
      const event = events.find((item) => item.id === eventId) ?? null;
      return { source: "supabase", event };
    }
  }

  const event = memoryEvents.get(eventId);
  if (!event) return { source: "memory", event: null };

  event.userStatuses[userId] = status;
  return { source: "memory", event: toEventItem(event, userId) };
}

export async function createEvent(
  userId: string,
  input: CreateEventInput,
  supabase: SupabaseLikeClient | null
): Promise<{ source: "supabase" | "memory"; event: EventItem }> {
  const id = globalThis.crypto?.randomUUID?.() ?? `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

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
        created_by: userId,
      })
      .select("id,title,description,starts_at,location,category,micro_event,created_by")
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
          createdBy: data.created_by ?? userId,
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
    createdBy: userId,
    userStatuses: {},
  };
  memoryEvents.set(memoryEvent.id, memoryEvent);
  return { source: "memory", event: toEventItem(memoryEvent, userId) };
}

export async function getEventHost(
  eventId: string,
  supabase: SupabaseLikeClient | null
): Promise<string | null> {
  if (supabase) {
    const { data, error } = await supabase.from("events").select("created_by").eq("id", eventId).maybeSingle();
    if (error || !data) return null;
    return data.created_by ?? null;
  }

  return memoryEvents.get(eventId)?.createdBy ?? null;
}

export async function updateEvent(
  userId: string,
  eventId: string,
  input: UpdateEventInput,
  supabase: SupabaseLikeClient | null
): Promise<{ source: "supabase" | "memory"; event: EventItem | null }> {
  if (supabase) {
    const updates: Record<string, unknown> = {};
    if (typeof input.title === "string") updates.title = input.title;
    if (typeof input.description === "string") updates.description = input.description;
    if (typeof input.startsAt === "string") updates.starts_at = input.startsAt;
    if (typeof input.location === "string") updates.location = input.location;
    if (typeof input.category === "string") updates.category = input.category;
    if (typeof input.microEvent === "boolean") updates.micro_event = input.microEvent;

    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .eq("created_by", userId)
      .select("id")
      .maybeSingle();

    if (!error && data) {
      const { events } = await listEvents(userId, supabase);
      const updated = events.find((item) => item.id === eventId) ?? null;
      return { source: "supabase", event: updated };
    }
  }

  const event = memoryEvents.get(eventId);
  if (!event || event.createdBy !== userId) return { source: "memory", event: null };

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
  eventId: string,
  supabase: SupabaseLikeClient | null
): Promise<{ source: "supabase" | "memory"; deleted: boolean }> {
  if (supabase) {
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("created_by", userId)
      .select("id")
      .maybeSingle();

    if (!error && data) return { source: "supabase", deleted: true };
  }

  const event = memoryEvents.get(eventId);
  if (!event || event.createdBy !== userId) return { source: "memory", deleted: false };

  memoryEvents.delete(eventId);
  return { source: "memory", deleted: true };
}
