"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EventItem, RSVPStatus } from "@/lib/events-types";

type ViewMode = "calendar" | "list";
type FilterMode = "all" | "micro";

type EventsResponse = {
  source: "supabase" | "memory";
  events: EventItem[];
};
type CreateEventForm = {
  title: string;
  description: string;
  location: string;
  category: string;
  date: string;
  time: string;
  microEvent: boolean;
};
type SettingsTab = "create" | "manage";

const currentUserId = "demo-user";

function getDefaultDateTime() {
  const defaultDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
  const date = defaultDate.toISOString().slice(0, 10);
  const time = "18:00";
  return { date, time };
}

function localDayKey(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthGridDates(monthAnchor: Date) {
  const first = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function getEventPillClass(event: EventItem) {
  if (event.microEvent) return "bg-[#caa93f] text-[#1f2318] dark:bg-amber-500 dark:text-slate-950";
  const category = event.category.toLowerCase();
  if (category.includes("network")) return "bg-[#6e7d5b] text-white dark:bg-emerald-600";
  if (category.includes("well")) return "bg-[#879668] text-white dark:bg-lime-600";
  if (category.includes("work")) return "bg-[#b85a57] text-white dark:bg-rose-600";
  return "bg-[#7f8d62] text-white dark:bg-teal-600";
}

const statusLabels: Record<RSVPStatus, string> = {
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [source, setSource] = useState<"supabase" | "memory">("memory");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [loading, setLoading] = useState(true);
  const [savingEventId, setSavingEventId] = useState<string | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("create");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateEventForm>(() => {
    const { date, time } = getDefaultDateTime();
    return {
      title: "",
      description: "",
      location: "Community Lounge",
      category: "Community",
      date,
      time,
      microEvent: false,
    };
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return filterMode === "micro" ? events.filter((event) => event.microEvent) : events;
  }, [events, filterMode]);

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, EventItem[]>();
    filteredEvents.forEach((event) => {
      const key = localDayKey(event.startsAt);
      const bucket = grouped.get(key) ?? [];
      bucket.push(event);
      grouped.set(key, bucket);
    });
    return grouped;
  }, [filteredEvents]);

  const monthDates = useMemo(() => getMonthGridDates(calendarMonth), [calendarMonth]);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/events", {
        headers: {
          "x-user-id": currentUserId,
        },
      });

      if (!response.ok) throw new Error("Failed to load events");

      const data = (await response.json()) as EventsResponse;
      setEvents(data.events);
      setSource(data.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load events");
    } finally {
      setLoading(false);
    }
  }

  async function handleRSVP(eventId: string, status: RSVPStatus) {
    const previous = events;

    const optimistic = previous.map((event) => {
      if (event.id !== eventId) return event;

      const nextCounts = { ...event.rsvpCounts };
      const nextMembers: Record<RSVPStatus, string[]> = {
        yes: [...event.rsvpMembers.yes],
        maybe: [...event.rsvpMembers.maybe],
        no: [...event.rsvpMembers.no],
      };

      if (event.userRsvp) {
        nextCounts[event.userRsvp] = Math.max(0, nextCounts[event.userRsvp] - 1);
        nextMembers[event.userRsvp] = nextMembers[event.userRsvp].filter(
          (member) => member !== currentUserId
        );
      }
      nextCounts[status] += 1;
      if (!nextMembers[status].includes(currentUserId)) {
        nextMembers[status].push(currentUserId);
      }

      return {
        ...event,
        userRsvp: status,
        rsvpCounts: nextCounts,
        rsvpMembers: nextMembers,
      };
    });

    setEvents(optimistic);
    setSavingEventId(eventId);

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update RSVP");

      const result = (await response.json()) as { event: EventItem };
      setEvents((items) => items.map((item) => (item.id === eventId ? result.event : item)));
    } catch (err) {
      setEvents(previous);
      setError(err instanceof Error ? err.message : "Could not update RSVP");
    } finally {
      setSavingEventId(null);
    }
  }

  function openCreateModal() {
    const { date, time } = getDefaultDateTime();
    setCreateForm({
      title: "",
      description: "",
      location: "Community Lounge",
      category: "Community",
      date,
      time,
      microEvent: false,
    });
    setCreateFormError(null);
    setEditingEventId(null);
    setSettingsTab("create");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (creatingEvent) return;
    setIsCreateModalOpen(false);
    setCreateFormError(null);
  }

  function startEditingEvent(event: EventItem) {
    const startsAt = new Date(event.startsAt);
    const local = new Date(startsAt.getTime() - startsAt.getTimezoneOffset() * 60000);
    const date = local.toISOString().slice(0, 10);
    const time = local.toISOString().slice(11, 16);

    setCreateForm({
      title: event.title,
      description: event.description,
      location: event.location,
      category: event.category,
      date,
      time,
      microEvent: event.microEvent,
    });
    setEditingEventId(event.id);
    setCreateFormError(null);
    setSettingsTab("create");
  }

  async function handleDeleteEvent(eventId: string) {
    if (!window.confirm("Delete this event?")) return;
    setDeletingEventId(eventId);
    setCreateFormError(null);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUserId },
      });
      if (!response.ok) throw new Error("Failed to delete event");
      setEvents((items) => items.filter((item) => item.id !== eventId));
    } catch (err) {
      setCreateFormError(err instanceof Error ? err.message : "Could not delete event");
    } finally {
      setDeletingEventId(null);
    }
  }

  async function handleCreateEventSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createForm.title.trim() || !createForm.location.trim() || !createForm.date || !createForm.time) {
      setCreateFormError("Please fill title, location, date, and time.");
      return;
    }

    const startsAt = new Date(`${createForm.date}T${createForm.time}`);
    if (Number.isNaN(startsAt.getTime())) {
      setCreateFormError("Please choose a valid date and time.");
      return;
    }

    setCreatingEvent(true);
    setCreateFormError(null);
    try {
      const response = await fetch(
        editingEventId ? `/api/events/${editingEventId}` : "/api/events",
        {
        method: editingEventId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({
          title: createForm.title.trim(),
          location: createForm.location.trim(),
          description: createForm.description.trim() || "Community-submitted event.",
          startsAt: startsAt.toISOString(),
          category: createForm.category.trim() || "Community",
          microEvent: createForm.microEvent,
          createdBy: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error(editingEventId ? "Failed to update event" : "Failed to create event");
      }

      const result = (await response.json()) as { event: EventItem; source: "supabase" | "memory" };
      setSource(result.source);
      setEvents((items) => {
        const withoutCurrent = items.filter((item) => item.id !== result.event.id);
        return [...withoutCurrent, result.event].sort(
          (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        );
      });
      setEditingEventId(null);
      setIsCreateModalOpen(false);
    } catch (err) {
      setCreateFormError(err instanceof Error ? err.message : "Could not save event");
    } finally {
      setCreatingEvent(false);
    }
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border-2 border-[#314966] bg-[#dce9f8] p-5 shadow-[0_10px_24px_rgba(39,64,92,0.2)] dark:border-slate-600 dark:bg-slate-900/90 dark:shadow-[0_10px_24px_rgba(2,6,23,0.55)] sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-[#b9cfea] dark:bg-slate-800/80" />
      <div className="relative z-10">
      <header className="mt-2 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#4f5942] dark:text-slate-300">
          <span className="rounded-md border border-[#8ea8c8] bg-[#c4d9f1] px-2 py-1 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">Events</span>
          <span className="rounded-md border border-[#8ea8c8] bg-[#e2edf9] px-2 py-1 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200">
            Data: {source === "supabase" ? "Live DB" : "Memory fallback"}
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#222620] dark:text-slate-100 sm:text-4xl">
          Upcoming Events
        </h1>
        <p className="max-w-2xl text-sm text-[#4f5942] dark:text-slate-300 sm:text-base">
          Calendar + list view with fast RSVP actions and quick yes/maybe/no visibility.
        </p>
      </header>

      <div className="relative z-10 mt-6 flex flex-wrap gap-3">
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          className={viewMode === "calendar" ? "border border-[#49658a] bg-[#99b6dc] text-[#15263d] hover:bg-[#89a8d2] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400" : "border border-[#49658a] bg-[#edf3fb] text-[#1d3048] hover:bg-[#deebf8] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}
          onClick={() => setViewMode("calendar")}
        >
          Calendar
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          className={viewMode === "list" ? "border border-[#49658a] bg-[#99b6dc] text-[#15263d] hover:bg-[#89a8d2] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400" : "border border-[#49658a] bg-[#edf3fb] text-[#1d3048] hover:bg-[#deebf8] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}
          onClick={() => setViewMode("list")}
        >
          List
        </Button>
        <Button
          variant={filterMode === "all" ? "default" : "outline"}
          className={filterMode === "all" ? "border border-[#49658a] bg-[#a8c1e3] text-[#15263d] hover:bg-[#98b3db] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400" : "border border-[#49658a] bg-[#edf3fb] text-[#1d3048] hover:bg-[#deebf8] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}
          onClick={() => {
            setFilterMode("all");
            setViewMode("list");
          }}
        >
          All events
        </Button>
        <Button
          variant={filterMode === "micro" ? "default" : "outline"}
          className={filterMode === "micro" ? "border border-[#49658a] bg-[#a8c1e3] text-[#15263d] hover:bg-[#98b3db] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400" : "border border-[#49658a] bg-[#edf3fb] text-[#1d3048] hover:bg-[#deebf8] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}
          onClick={() => setFilterMode("micro")}
        >
          Micro-events
        </Button>
        <Button
          variant="outline"
          className="border border-[#49658a] bg-[#f3c36b] text-[#1f2f45] hover:bg-[#eab75b] dark:border-amber-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
          onClick={openCreateModal}
          disabled={creatingEvent || isCreateModalOpen}
        >
          Event settings
        </Button>
      </div>

      {error ? (
        <div className="relative z-10 mt-4 rounded-xl border-[2px] border-[#7e2d2d] bg-[#ffe5e5] px-4 py-3 text-sm text-[#7a2626] dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl border border-[#ccd1b8] bg-[#f7f4e3] dark:border-slate-700 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : viewMode === "calendar" ? (
        <div className="relative z-10 mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-xl border-[2px] border-[#25364d] bg-[#e2edf9] px-3 py-2 dark:border-slate-600 dark:bg-slate-800">
            <div className="text-sm font-medium text-[#1f2a1a] dark:text-slate-100">
              {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                onClick={() =>
                  setCalendarMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                onClick={() => {
                  const now = new Date();
                  setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                }}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                onClick={() =>
                  setCalendarMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border-[2px] border-[#25364d] bg-[#e2edf9] dark:border-slate-600 dark:bg-slate-900">
            <div className="grid grid-cols-7 border-b-[2px] border-[#25364d] bg-[#c6daf1] dark:border-slate-600 dark:bg-slate-800">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="border-r border-[#25364d]/35 px-2 py-2 text-center text-xs font-bold text-[#355072] last:border-r-0 dark:border-slate-700 dark:text-slate-300"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDates.map((date) => {
                const key = localDayKey(date);
                const dayEvents = eventsByDay.get(key) ?? [];
                const inCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                return (
                  <div
                    key={key}
                    className="min-h-32 border-r border-b border-[#25364d]/20 px-2 py-2 last:border-r-0 dark:border-slate-700"
                  >
                    <p
                      className={
                        inCurrentMonth
                          ? "text-xs font-semibold text-[#1f2a1a] dark:text-slate-100"
                          : "text-xs font-medium text-[#a9ae97] dark:text-slate-500"
                      }
                    >
                      {date.getDate()}
                    </p>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 4).map((event) => (
                        <div
                          key={event.id}
                          className={`truncate rounded-md px-2 py-1 text-[11px] font-medium ${getEventPillClass(event)}`}
                          title={`${event.title} · ${new Date(event.startsAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 4 ? (
                        <p className="text-[11px] font-medium text-[#6a7458] dark:text-slate-400">
                          +{dayEvents.length - 4} more
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mt-6 grid gap-4 lg:grid-cols-2">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border-[2px] border-[#25364d] bg-[#e2edf9] p-5 shadow-[4px_4px_0_#25364d] dark:border-slate-600 dark:bg-slate-800 dark:shadow-[4px_4px_0_#0f172a]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f2a1a] dark:text-slate-100">{event.title}</h2>
                  <p className="mt-1 text-sm text-[#3f4a33] dark:text-slate-300">{event.description}</p>
                </div>
                {event.microEvent ? (
                  <span className="rounded-md border border-[#25364d] bg-[#c6daf1] px-2 py-0.5 text-xs text-[#355072] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    Micro-event
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#2b3424] dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {new Date(event.startsAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" />
                  {new Date(event.startsAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {event.location}
                </span>
              </div>

              <div className="mt-3 text-sm text-[#2b3424] dark:text-slate-300">
                Added by: <span className="font-medium">{event.createdBy}</span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-[#4f5942] dark:text-slate-400">
                <p>
                  Yes ({event.rsvpCounts.yes}):{" "}
                  {event.rsvpMembers.yes.length ? event.rsvpMembers.yes.join(", ") : "None"}
                </p>
                <p>
                  Maybe ({event.rsvpCounts.maybe}):{" "}
                  {event.rsvpMembers.maybe.length ? event.rsvpMembers.maybe.join(", ") : "None"}
                </p>
                <p>
                  No ({event.rsvpCounts.no}):{" "}
                  {event.rsvpMembers.no.length ? event.rsvpMembers.no.join(", ") : "None"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(Object.keys(statusLabels) as RSVPStatus[]).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    className={
                      event.userRsvp === status
                        ? "border-[2px] border-[#25364d] bg-[#88a9d4] text-[#15263d] hover:bg-[#789ac8] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                        : "border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] hover:bg-[#d3e2f4] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                    }
                    onClick={() => void handleRSVP(event.id, status)}
                    disabled={savingEventId === event.id}
                  >
                    {statusLabels[status]}
                  </Button>
                ))}
              </div>
            </article>
          ))}
          {!filteredEvents.length ? (
            <div className="rounded-xl border-[2px] border-[#25364d] bg-[#e2edf9] p-6 text-sm text-[#355072] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
              No events in this filter.
            </div>
          ) : null}
        </div>
      )}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-2xl rounded-xl border-[3px] border-[#25364d] bg-[#e2edf9] p-0 shadow-[8px_8px_0_#25364d] dark:border-slate-600 dark:bg-slate-900 dark:shadow-[8px_8px_0_#020617]">
            <div className="border-b-[2px] border-[#25364d] px-5 py-4 sm:px-6 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-[#1f2a1a] dark:text-slate-100">Event settings</h2>
              <p className="text-sm text-[#4f5942] dark:text-slate-300">Create, edit, or delete events.</p>
            </div>

            <div className="flex gap-2 border-b border-[#25364d]/30 px-5 py-3 sm:px-6 dark:border-slate-700">
              <Button
                type="button"
                size="sm"
                variant={settingsTab === "create" ? "default" : "outline"}
                className={settingsTab === "create" ? "border-[2px] border-[#25364d] bg-[#88a9d4] text-[#15263d] hover:bg-[#789ac8] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400" : "border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"}
                onClick={() => setSettingsTab("create")}
              >
                {editingEventId ? "Edit event" : "Create event"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={settingsTab === "manage" ? "default" : "outline"}
                className={settingsTab === "manage" ? "border-[2px] border-[#25364d] bg-[#88a9d4] text-[#15263d] hover:bg-[#789ac8] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400" : "border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"}
                onClick={() => setSettingsTab("manage")}
              >
                Manage events
              </Button>
            </div>

            {settingsTab === "create" ? (
            <form className="space-y-4 px-5 py-4 sm:px-6" onSubmit={handleCreateEventSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#2b3424] dark:text-slate-200" htmlFor="event-title">
                  Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  className="w-full rounded-md border-[2px] border-[#25364d]/40 bg-[#f3f8ff] px-3 py-2 text-sm text-[#1f2a1a] outline-none ring-[#88a9d4] focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-sky-500"
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Community Meetup"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#2b3424] dark:text-slate-200" htmlFor="event-date">
                    Date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    className="w-full rounded-md border-[2px] border-[#25364d]/40 bg-[#f3f8ff] px-3 py-2 text-sm text-[#1f2a1a] outline-none ring-[#88a9d4] focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-sky-500"
                    value={createForm.date}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, date: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#2b3424] dark:text-slate-200" htmlFor="event-time">
                    Time
                  </label>
                  <input
                    id="event-time"
                    type="time"
                    className="w-full rounded-md border-[2px] border-[#25364d]/40 bg-[#f3f8ff] px-3 py-2 text-sm text-[#1f2a1a] outline-none ring-[#88a9d4] focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-sky-500"
                    value={createForm.time}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, time: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#2b3424] dark:text-slate-200" htmlFor="event-location">
                  Location
                </label>
                <input
                  id="event-location"
                  type="text"
                  className="w-full rounded-md border-[2px] border-[#25364d]/40 bg-[#f3f8ff] px-3 py-2 text-sm text-[#1f2a1a] outline-none ring-[#88a9d4] focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-sky-500"
                  value={createForm.location}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                  placeholder="Community Lounge"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#2b3424] dark:text-slate-200" htmlFor="event-description">
                  Description
                </label>
                <textarea
                  id="event-description"
                  className="min-h-20 w-full rounded-md border-[2px] border-[#25364d]/40 bg-[#f3f8ff] px-3 py-2 text-sm text-[#1f2a1a] outline-none ring-[#88a9d4] focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-sky-500"
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="What will happen in this event?"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#2b3424] dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={createForm.microEvent}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, microEvent: event.target.checked }))
                  }
                />
                Mark as micro-event
              </label>

              {createFormError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {createFormError}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  onClick={closeCreateModal}
                  disabled={creatingEvent}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="border-[2px] border-[#25364d] bg-[#88a9d4] text-[#15263d] hover:bg-[#789ac8] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                  disabled={creatingEvent}
                >
                  {creatingEvent ? "Saving..." : editingEventId ? "Save Changes" : "Create Event"}
                </Button>
              </div>
            </form>
            ) : (
              <div className="space-y-3 px-5 py-4 sm:px-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border-[2px] border-[#25364d]/40 bg-[#dbe9f8] p-3 dark:border-slate-600 dark:bg-slate-800"
                  >
                    <p className="font-medium text-[#1f2a1a] dark:text-slate-100">{event.title}</p>
                    <p className="text-xs text-[#4f5942] dark:text-slate-300">
                      {new Date(event.startsAt).toLocaleString()} | {event.location}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                        onClick={() => startEditingEvent(event)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[2px] border-[#7e2d2d] bg-[#f7d8d8] text-[#7a2626] hover:bg-[#efc8c8]"
                        onClick={() => void handleDeleteEvent(event.id)}
                        disabled={deletingEventId === event.id}
                      >
                        {deletingEventId === event.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
                {!events.length ? (
                  <p className="text-sm text-[#4f5942] dark:text-slate-300">No events yet.</p>
                ) : null}
                {createFormError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {createFormError}
                  </p>
                ) : null}
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[2px] border-[#25364d] bg-[#e2edf9] text-[#1d3048] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    onClick={closeCreateModal}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
      </div>
    </section>
  );
}
