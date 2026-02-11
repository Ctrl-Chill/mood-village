import { NextResponse } from "next/server";

import { setEventRsvp } from "@/lib/events-store";
import { getRouteAuth } from "@/lib/supabase-server";
import type { RSVPStatus } from "@/lib/events-types";

function isRSVPStatus(value: string): value is RSVPStatus {
  return value === "yes" || value === "maybe" || value === "no";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { userId, supabase } = await getRouteAuth();
  const actorId = userId ?? (supabase ? null : "guest-user");
  if (!actorId) {
    return NextResponse.json({ error: "You must be signed in to RSVP" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  if (!body?.status || !isRSVPStatus(body.status)) {
    return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
  }

  const { eventId } = await params;
  const result = await setEventRsvp(actorId, eventId, body.status, supabase);

  if (!result.event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ source: result.source, event: result.event });
}
