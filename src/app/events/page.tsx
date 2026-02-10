export default function EventsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Upcoming
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Events</h1>
        <p className="max-w-2xl text-base text-slate-600">
          Plan gatherings that nurture the group. Host circles, walks, and
          workshops that help the village recharge.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            Candlelight reflection circle
          </p>
          <p className="text-sm text-slate-500">Thu, 7:00 PM</p>
          <p className="mt-2 text-sm text-slate-600">
            A quiet space for sharing gratitude and setting intentions.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            Sunrise neighborhood walk
          </p>
          <p className="text-sm text-slate-500">Sat, 8:30 AM</p>
          <p className="mt-2 text-sm text-slate-600">
            Stretch, breathe, and connect before the day begins.
          </p>
        </div>
      </div>
    </section>
  );
}
