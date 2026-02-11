import { NextResponse } from "next/server";

import { deleteEvent, updateEvent } from "@/lib/events-store";

function getUserId(request: Request): string {
  return request.headers.get("x-user-id") ?? "guest-user";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
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
    const result = await updateEvent(getUserId(request), eventId, body);
    if (!result.event) {
      return NextResponse.json(
        { error: "Event not found or host permission required" },
        { status: 403 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const result = await deleteEvent(getUserId(request), eventId);
    if (!result.deleted) {
      return NextResponse.json(
        { error: "Event not found or host permission required" },
        { status: 403 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
