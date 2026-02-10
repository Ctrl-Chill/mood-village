export default function ProgressPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Trends
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Progress</h1>
        <p className="max-w-2xl text-base text-slate-600">
          Track how the community feels week to week and spot moments worth
          celebrating.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Weekly mood</p>
          <p className="text-2xl font-semibold text-slate-900">Stable</p>
          <p className="text-sm text-slate-500">+4% from last week</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Energy trend</p>
          <p className="text-2xl font-semibold text-slate-900">Rising</p>
          <p className="text-sm text-slate-500">Most active on Thursday</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Connections</p>
          <p className="text-2xl font-semibold text-slate-900">3.8 / 5</p>
          <p className="text-sm text-slate-500">16 supportive replies</p>
        </div>
      </div>
    </section>
  );
}
