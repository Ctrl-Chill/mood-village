import { createClient } from "@supabase/supabase-js";

import type { EventItem, RSVPStatus } from "@/lib/events-types";

type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          community_id: string;
          title: string;
          description: string | null;
          type: "gratitude" | "co-working" | "circle" | null;
          start_at: string | null;
          capacity: number | null;
          created_by: string | null;
        };
        Insert: {
          id: string;
          community_id: string;
          title: string;
          description?: string | null;
          type?: "gratitude" | "co-working" | "circle" | null;
          start_at?: string | null;
          capacity?: number | null;
          created_by?: string | null;
        };
        Update: Partial<{
          community_id: string;
          title: string;
          description: string | null;
          type: "gratitude" | "co-working" | "circle" | null;
          start_at: string | null;
          capacity: number | null;
          created_by: string | null;
        }>;
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: RSVPStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status: RSVPStatus;
          created_at?: string;
        };
        Update: Partial<{
          status: RSVPStatus;
          created_at: string;
        }>;
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          community_id: string;
          role: "member" | "moderator" | "admin";
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          community_id: string;
          role?: "member" | "moderator" | "admin";
        };
        Update: Partial<{
          role: "member" | "moderator" | "admin";
        }>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          community_id: string | null;
        };
        Insert: {
          id: string;
          community_id?: string | null;
        };
        Update: Partial<{
          community_id: string | null;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

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
type SupabaseEventRow = {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  type: "gratitude" | "co-working" | "circle" | null;
  start_at: string | null;
  capacity: number | null;
  created_by: string | null;
};
type SupabaseRsvpRow = {
  event_id: string;
  user_id: string;
  status: string;
};

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

type SupabaseClient = ReturnType<typeof createClient<Database>> | null;

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createClient<Database>(url, key, { auth: { persistSession: false } });
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

function toEventType(category: string): "gratitude" | "co-working" | "circle" {
  const normalized = category.toLowerCase();
  if (normalized.includes("gratitude")) return "gratitude";
  if (normalized.includes("work")) return "co-working";
  return "circle";
}

function fromEventType(type: "gratitude" | "co-working" | "circle" | null): string {
  if (!type) return "General";
  if (type === "co-working") return "Co-working";
  if (type === "gratitude") return "Gratitude";
  return "Circle";
}

async function resolveCommunityId(supabase: NonNullable<SupabaseClient>, userId: string) {
  const envCommunityId = process.env.SUPABASE_DEFAULT_COMMUNITY_ID;
  if (envCommunityId) return envCommunityId;

  const { data: profile } = await supabase
    .from("profiles")
    .select("community_id")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.community_id) return profile.community_id;

  const { data: membership } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  return membership?.community_id ?? null;
}

export async function listEvents(userId: string): Promise<{ source: "supabase" | "memory"; events: EventItem[] }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const communityId = await resolveCommunityId(supabase, userId);
    if (!communityId) {
      return { source: "supabase", events: [] };
    }

    const { data: eventRows, error: eventsError } = await supabase
      .from("events")
      .select("id,community_id,title,description,type,start_at,capacity,created_by")
      .order("start_at", { ascending: true })
      .eq("community_id", communityId);

    if (eventsError || !eventRows) {
      throw new Error(`Could not load events from Supabase: ${eventsError?.message ?? "unknown error"}`);
    }

    const typedEventRows = eventRows as unknown as SupabaseEventRow[];
    if (typedEventRows.length === 0) {
      return { source: "supabase", events: [] };
    }

    const eventIds = typedEventRows.map((event) => event.id);
    const { data: allRsvps, error: rsvpError } = await supabase
      .from("rsvps")
      .select("event_id,user_id,status")
      .in("event_id", eventIds);

    if (rsvpError || !allRsvps) {
      throw new Error(`Could not load RSVPs from Supabase: ${rsvpError?.message ?? "unknown error"}`);
    }

    const typedRsvps = allRsvps as unknown as SupabaseRsvpRow[];
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
            if (rsvp.user_id === userId) {
              userRsvp = rsvp.status;
            }
          }
        });

      return {
        id: event.id,
        title: event.title,
        description: event.description ?? "",
        startsAt: event.start_at ?? new Date().toISOString(),
        location: "Community Event",
        category: fromEventType(event.type),
        microEvent: (event.capacity ?? 999) <= 10,
        createdBy: event.created_by ?? "community-team",
        rsvpCounts: counts,
        rsvpMembers: members,
        userRsvp,
      } satisfies EventItem;
    });

    return { source: "supabase", events: rows };
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
    const { data: existing, error: selectError } = await supabase
      .from("rsvps")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    let writeError: unknown = selectError;
    if (!selectError) {
      if (existing?.id) {
        const { error } = await supabase.from("rsvps").update({ status }).eq("id", existing.id);
        writeError = error;
      } else {
        const { error } = await supabase.from("rsvps").insert({ event_id: eventId, user_id: userId, status });
        writeError = error;
      }
    }

    if (writeError) {
      throw new Error("Could not save RSVP in Supabase.");
    }

    const { events } = await listEvents(userId);
    const event = events.find((item) => item.id === eventId) ?? null;
    return { source: "supabase", event };
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
    const communityId = await resolveCommunityId(supabase, userId);
    if (!communityId) {
      throw new Error(
        "No community found for this user. Set SUPABASE_DEFAULT_COMMUNITY_ID or add memberships/profiles.community_id."
      );
    }
    const { data, error } = await supabase
      .from("events")
      .insert({
        id,
        community_id: communityId,
        title: input.title,
        description: input.description,
        type: toEventType(input.category),
        start_at: input.startsAt,
        capacity: input.microEvent ? 10 : 100,
        created_by: input.createdBy,
      })
      .select("id,community_id,title,description,type,start_at,capacity,created_by")
      .single();

    if (error || !data) {
      throw new Error(`Could not create event in Supabase: ${error?.message ?? "unknown error"}`);
    }

    return {
      source: "supabase",
      event: {
        id: data.id,
        title: data.title,
        description: data.description ?? "",
        startsAt: data.start_at ?? input.startsAt,
        location: input.location || "Community Event",
        category: fromEventType(data.type),
        microEvent: (data.capacity ?? 999) <= 10,
        createdBy: data.created_by ?? input.createdBy,
        rsvpCounts: { yes: 0, maybe: 0, no: 0 },
        rsvpMembers: { yes: [], maybe: [], no: [] },
        userRsvp: null,
      },
    };
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
    const updates: Database["public"]["Tables"]["events"]["Update"] = {};
    if (typeof input.title === "string") updates.title = input.title;
    if (typeof input.description === "string") updates.description = input.description;
    if (typeof input.startsAt === "string") updates.start_at = input.startsAt;
    if (typeof input.category === "string") updates.type = toEventType(input.category);
    if (typeof input.microEvent === "boolean") updates.capacity = input.microEvent ? 10 : 100;

    const { error, data } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .eq("created_by", userId)
      .select("id")
      .maybeSingle();
    if (error) {
      throw new Error(`Could not update event in Supabase: ${error.message}`);
    }
    if (!data) {
      return { source: "supabase", event: null };
    }
    const { events } = await listEvents(userId);
    const updated = events.find((item) => item.id === eventId) ?? null;
    return { source: "supabase", event: updated };
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
    const { error, data } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("created_by", userId)
      .select("id")
      .maybeSingle();
    if (error) {
      throw new Error(`Could not delete event in Supabase: ${error.message}`);
    }
    return { source: "supabase", deleted: Boolean(data) };
  }

  const event = memoryEvents.get(eventId);
  if (!event || event.createdBy !== userId) return { source: "memory", deleted: false };
  return { source: "memory", deleted: memoryEvents.delete(eventId) };
}
