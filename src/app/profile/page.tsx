export default function ProfilePage() {
  return (
    <section className="space-y-6 rounded-2xl border-2 border-[#314966] bg-[#dce9f8] p-6 shadow-[0_8px_20px_rgba(39,64,92,0.18)]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#355072]">
          Account
        </p>
        <h1 className="text-3xl font-black text-[#15263d]">Profile</h1>
        <p className="max-w-2xl text-base text-[#355072]">
          Keep your details up to date and manage your village membership.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Your details</p>
          <p className="text-sm text-[#355072]">
            Name, email, and notification preferences.
          </p>
        </div>
        <div className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Memberships</p>
          <p className="text-sm text-[#355072]">
            See communities you belong to and adjust roles.
          </p>
        </div>
      </div>
    </section>
  );
}
