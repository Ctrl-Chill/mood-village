export default function AboutPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
          Community wellness, together
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          A shared space to check in, celebrate wins, and keep the village
          connected.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Mood Village brings check-ins, events, and progress into one calm
          dashboard. Start by joining your village, then share gratitude,
          ask for support, and track how the community feels.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Check in often</p>
          <p className="text-sm text-slate-500">
            Quick mood snapshots help the village stay responsive.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Share gratitude</p>
          <p className="text-sm text-slate-500">
            Celebrate the helpers, the wins, and the small moments.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Create events</p>
          <p className="text-sm text-slate-500">
            Gather the village with rituals, workshops, and meetups.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Track progress</p>
          <p className="text-sm text-slate-500">
            See how the community feels and respond with care.
          </p>
        </div>
      </div>
    </section>
  );
}
