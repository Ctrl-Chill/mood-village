export default function VillagePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Village hub
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Your village</h1>
        <p className="max-w-2xl text-base text-slate-600">
          Welcome home. Share a check-in, celebrate gratitude posts, and stay
          connected with your people.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Quick check-in</p>
          <p className="text-sm text-slate-500">
            Log stress, energy, and connectedness in under a minute.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Gratitude wall</p>
          <p className="text-sm text-slate-500">
            Highlight wins and thank someone publicly.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Ask for support</p>
          <p className="text-sm text-slate-500">
            Post a request and see who can help.
          </p>
        </div>
      </div>
    </section>
  );
}
