import { NextResponse } from "next/server";

import { setEventRsvp } from "@/lib/events-store";
import type { RSVPStatus } from "@/lib/events-types";

function getUserId(request: Request): string {
  return request.headers.get("x-user-id") ?? "guest-user";
}

function isRSVPStatus(value: string): value is RSVPStatus {
  return value === "yes" || value === "maybe" || value === "no";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  if (!body?.status || !isRSVPStatus(body.status)) {
    return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
  }

  const { eventId } = await params;
  const result = await setEventRsvp(getUserId(request), eventId, body.status);

  if (!result.event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ source: result.source, event: result.event });
}
