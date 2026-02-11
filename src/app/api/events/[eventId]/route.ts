import { NextResponse } from "next/server";

import { deleteEvent, getEventHost, updateEvent } from "@/lib/events-store";
import { getRouteAuth } from "@/lib/supabase-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { userId, supabase } = await getRouteAuth();
  const actorId = userId ?? (supabase ? null : "guest-user");
  if (!actorId) {
    return NextResponse.json({ error: "You must be signed in to edit events" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        title?: string;
        description?: string;
        startsAt?: string;
        location?: string;
        category?: string;
        microEvent?: boolean;
      }
    | null;

  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { eventId } = await params;
  const hostId = await getEventHost(eventId, supabase);
  if (!hostId) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (hostId !== actorId) {
    return NextResponse.json({ error: "Only the event host can edit this event" }, { status: 403 });
  }

  const result = await updateEvent(actorId, eventId, body, supabase);
  if (!result.event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { userId, supabase } = await getRouteAuth();
  const actorId = userId ?? (supabase ? null : "guest-user");
  if (!actorId) {
    return NextResponse.json({ error: "You must be signed in to delete events" }, { status: 401 });
  }

  const { eventId } = await params;
  const hostId = await getEventHost(eventId, supabase);
  if (!hostId) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (hostId !== actorId) {
    return NextResponse.json({ error: "Only the event host can delete this event" }, { status: 403 });
  }

  const result = await deleteEvent(actorId, eventId, supabase);
  if (!result.deleted) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json(result);
}
