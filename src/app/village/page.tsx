export default function VillagePage() {
  return (
    <section className="space-y-6 rounded-2xl border-2 border-[#314966] bg-[#dce9f8] p-6 shadow-[0_8px_20px_rgba(39,64,92,0.18)]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#355072]">
          Village hub
        </p>
        <h1 className="text-3xl font-black text-[#15263d]">Your village</h1>
        <p className="max-w-2xl text-base text-[#355072]">
          Welcome home. Share a check-in, celebrate gratitude posts, and stay
          connected with your people.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Quick check-in</p>
          <p className="text-sm text-[#355072]">
            Log stress, energy, and connectedness in under a minute.
          </p>
        </div>
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Gratitude wall</p>
          <p className="text-sm text-[#355072]">
            Highlight wins and thank someone publicly.
          </p>
        </div>
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Ask for support</p>
          <p className="text-sm text-[#355072]">
            Post a request and see who can help.
          </p>
        </div>
      </div>
    </section>
  );
}
