export default function ProfilePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Account
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="max-w-2xl text-base text-slate-600">
          Keep your details up to date and manage your village membership.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Your details</p>
          <p className="text-sm text-slate-500">
            Name, email, and notification preferences.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Memberships</p>
          <p className="text-sm text-slate-500">
            See communities you belong to and adjust roles.
          </p>
        </div>
      </div>
    </section>
  );
}
