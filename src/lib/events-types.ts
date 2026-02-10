export type RSVPStatus = "yes" | "maybe" | "no";

export type EventItem = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  category: string;
  microEvent: boolean;
  createdBy: string;
  rsvpCounts: Record<RSVPStatus, number>;
  rsvpMembers: Record<RSVPStatus, string[]>;
  userRsvp: RSVPStatus | null;
};

export type EventsPayload = {
  source: "supabase" | "memory";
  events: EventItem[];
};
