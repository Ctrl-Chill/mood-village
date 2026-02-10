export default function AboutPage() {
  return (
    <section className="space-y-6 rounded-2xl border-2 border-[#314966] bg-[#dce9f8] p-6 shadow-[0_8px_20px_rgba(39,64,92,0.18)]">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-lg border border-[#49658a] bg-[#edf3fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#355072] shadow-[0_2px_0_#8da7c6]">
          Community wellness, together
        </p>
        <h1 className="text-4xl font-black leading-tight tracking-tight text-[#15263d] sm:text-5xl">
          A shared space to check in, celebrate wins, and keep the village
          connected.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[#355072]">
          Mood Village brings check-ins, events, and progress into one calm
          dashboard. Start by joining your village, then share gratitude,
          ask for support, and track how the community feels.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Check in often</p>
          <p className="text-sm text-[#355072]">
            Quick mood snapshots help the village stay responsive.
          </p>
        </div>
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Share gratitude</p>
          <p className="text-sm text-[#355072]">
            Celebrate the helpers, the wins, and the small moments.
          </p>
        </div>
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Create events</p>
          <p className="text-sm text-[#355072]">
            Gather the village with rituals, workshops, and meetups.
          </p>
        </div>
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Track progress</p>
          <p className="text-sm text-[#355072]">
            See how the community feels and respond with care.
          </p>
        </div>
      </div>
    </section>
  );
}
