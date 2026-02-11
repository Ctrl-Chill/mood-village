import { NextResponse } from "next/server";

import { createEvent, listEvents } from "@/lib/events-store";
import type { EventsPayload } from "@/lib/events-types";

function getUserId(request: Request): string {
  return request.headers.get("x-user-id") ?? "guest-user";
}

export async function GET(request: Request) {
  const result = await listEvents(getUserId(request));
  const payload: EventsPayload = { source: result.source, events: result.events };
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        title?: string;
        description?: string;
        startsAt?: string;
        location?: string;
        category?: string;
        microEvent?: boolean;
        createdBy?: string;
      }
    | null;

  if (!body?.title?.trim() || !body.startsAt || !body.location?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields: title, startsAt, location" },
      { status: 400 }
    );
  }

  const result = await createEvent(getUserId(request), {
    title: body.title.trim(),
    description: body.description?.trim() ?? "",
    startsAt: body.startsAt,
    location: body.location.trim(),
    category: body.category?.trim() || "General",
    microEvent: Boolean(body.microEvent),
    createdBy: body.createdBy?.trim() || getUserId(request),
  });

  return NextResponse.json(result, { status: 201 });
}
