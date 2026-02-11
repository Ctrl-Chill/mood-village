import { NextResponse } from "next/server";

import { createEvent, listEvents } from "@/lib/events-store";
import { getRouteAuth } from "@/lib/supabase-server";
import type { EventsPayload } from "@/lib/events-types";

export async function GET() {
  const { userId, supabase } = await getRouteAuth();
  const result = await listEvents(userId, supabase);
  const payload: EventsPayload = { source: result.source, events: result.events, userId };
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const { userId, supabase } = await getRouteAuth();
  const actorId = userId ?? (supabase ? null : "guest-user");
  if (!actorId) {
    return NextResponse.json({ error: "You must be signed in to create events" }, { status: 401 });
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

  if (!body?.title?.trim() || !body.startsAt || !body.location?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields: title, startsAt, location" },
      { status: 400 }
    );
  }

  const result = await createEvent(
    actorId,
    {
    title: body.title.trim(),
    description: body.description?.trim() ?? "",
    startsAt: body.startsAt,
    location: body.location.trim(),
    category: body.category?.trim() || "General",
    microEvent: Boolean(body.microEvent),
    },
    supabase
  );

  return NextResponse.json(result, { status: 201 });
}
