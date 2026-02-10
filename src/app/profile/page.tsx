"use client";

import { useState } from "react";

type SectionId = "overview" | "settings" | "safety" | "account";

const MOCK_USER = {
  id: "user-001",
  name: "Sarah Chen",
  email: "sarah.chen@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  community_id: "village-001",
  community_name: "Mood Village",
  trusted_contact: "Jane Smith",
  trusted_contact_phone: "+1 (555) 123-4567",
  membership_since: "January 2025",
  membership_tier: "Active Member",
};

const sections: Array<{ id: SectionId; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "👤" },
  { id: "settings", label: "Settings", icon: "⚙️" },
  { id: "safety", label: "Safety", icon: "🛡️" },
  { id: "account", label: "Account", icon: "🔐" },
];

export default function ProfilePage() {
  const [eventNotifications, setEventNotifications] = useState(true);
  const [villageNotifications, setVillageNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dataVisibility, setDataVisibility] = useState("friends");
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  const [trustedContactName, setTrustedContactName] = useState(MOCK_USER.trusted_contact);
  const [trustedContactPhone, setTrustedContactPhone] = useState(MOCK_USER.trusted_contact_phone);
  const [trustedContactDraftName, setTrustedContactDraftName] = useState(MOCK_USER.trusted_contact);
  const [trustedContactDraftPhone, setTrustedContactDraftPhone] = useState(MOCK_USER.trusted_contact_phone);
  const [isEditingTrustedContact, setIsEditingTrustedContact] = useState(false);

  const pageShell = darkMode
    ? "min-h-screen -mx-4 bg-slate-950 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    : "-mx-4 bg-transparent px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8";

  return (
    <div className={pageShell}>
      <section className="mx-auto w-full max-w-6xl space-y-6 pb-12">
        <header className="space-y-2">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              darkMode ? "text-sky-300" : "text-sky-700/80"
            }`}
          >
            Account
          </p>
        
        </header>

        <div
          className={`rounded-3xl border-2 p-4 transition-colors md:p-6 ${
            darkMode
              ? "border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-[10px_12px_0px_0px_rgba(30,41,59,0.95)]"
              : "border-sky-900/80 bg-gradient-to-b from-sky-100 to-sky-50 shadow-[8px_10px_0px_0px_rgba(30,58,138,0.8)]"
          }`}
        >
          <div className={`mb-5 flex flex-wrap gap-2 border-b pb-4 ${darkMode ? "border-slate-700" : "border-sky-200"}`}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  activeSection === section.id
                    ? darkMode
                      ? "border-slate-100 bg-slate-100 text-slate-900"
                      : "border-sky-800 bg-sky-200 text-sky-900"
                    : darkMode
                      ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "border-sky-300 bg-white/80 text-slate-700 hover:bg-sky-100"
                }`}
              >
                <span aria-hidden>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          {activeSection === "overview" && (
            <div className="space-y-4">
              <div
                className={`rounded-2xl border p-5 ${
                  darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <img
                    src={MOCK_USER.avatar}
                    alt={MOCK_USER.name}
                    className={`h-[84px] w-[84px] rounded-full border-4 ${
                      darkMode ? "border-slate-600 bg-slate-700" : "border-sky-100 bg-white"
                    }`}
                  />
                  <div className="flex-1 space-y-2">
                    <h2 className={`text-2xl font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                      {MOCK_USER.name}
                    </h2>
                    <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{MOCK_USER.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                        {MOCK_USER.community_name}
                      </span>
                      <span className="rounded-full border border-indigo-300 bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {MOCK_USER.membership_tier}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                      darkMode
                        ? "border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600"
                        : "border-sky-300 bg-white text-slate-700 hover:bg-sky-50"
                    }`}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <InfoCard label="User ID" value={MOCK_USER.id} icon="🆔" darkMode={darkMode} />
                <InfoCard label="Community ID" value={MOCK_USER.community_id} icon="🏘️" darkMode={darkMode} />
                <InfoCard label="Trusted Contact" value={trustedContactName || "Not set"} icon="🤝" darkMode={darkMode} />
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div
                className={`rounded-2xl border p-5 ${
                  darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"
                }`}
              >
                <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  Notifications
                </h3>
                <div className="space-y-4">
                  <ToggleSetting
                    label="Event notifications"
                    description="Get updates on events and RSVPs"
                    checked={eventNotifications}
                    onChange={setEventNotifications}
                    darkMode={darkMode}
                  />
                  <ToggleSetting
                    label="Village notifications"
                    description="Receive updates from your village"
                    checked={villageNotifications}
                    onChange={setVillageNotifications}
                    darkMode={darkMode}
                  />
                  <ToggleSetting
                    label="Push notifications"
                    description="Allow mobile/browser push alerts"
                    checked={pushNotifications}
                    onChange={setPushNotifications}
                    darkMode={darkMode}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className={`rounded-2xl border p-5 ${
                    darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"
                  }`}
                >
                  <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                    App Theme
                  </h3>
                  <ToggleSetting
                    label="Dark mode"
                    description="Switch between light and dark theme"
                    checked={darkMode}
                    onChange={setDarkMode}
                    darkMode={darkMode}
                  />
                </div>
                <div
                  className={`rounded-2xl border p-5 ${
                    darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"
                  }`}
                >
                  <h3 className={`mb-3 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                    Privacy
                  </h3>
                  <label className={`mb-2 block text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                    Profile visibility
                  </label>
                  <select
                    value={dataVisibility}
                    onChange={(event) => setDataVisibility(event.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      darkMode
                        ? "border-slate-500 bg-slate-700 text-slate-100 focus:border-slate-200 focus:ring-slate-500"
                        : "border-sky-300 bg-white text-slate-800 focus:border-sky-500 focus:ring-sky-200"
                    }`}
                  >
                    <option value="everyone">Everyone in village</option>
                    <option value="friends">Friends only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === "safety" && (
            <div className="space-y-4">
              <div
                className={`rounded-2xl border p-5 ${
                  darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                    Trusted Contact
                  </h3>
                  {!isEditingTrustedContact && (
                    <button
                      type="button"
                      onClick={() => {
                        setTrustedContactDraftName(trustedContactName);
                        setTrustedContactDraftPhone(trustedContactPhone);
                        setIsEditingTrustedContact(true);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        darkMode
                          ? "border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600"
                          : "border-sky-300 bg-white text-slate-700 hover:bg-sky-50"
                      }`}
                    >
                      Edit
                    </button>
                  )}
                </div>

                <p className={`mb-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  Your trusted contact can be reached during emergencies.
                </p>

                {isEditingTrustedContact ? (
                  <div className="space-y-3">
                    <div>
                      <label
                        className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${
                          darkMode ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        Contact name
                      </label>
                      <input
                        value={trustedContactDraftName}
                        onChange={(event) => setTrustedContactDraftName(event.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                          darkMode
                            ? "border-slate-500 bg-slate-700 text-slate-100 focus:border-slate-200 focus:ring-slate-500"
                            : "border-sky-300 bg-white text-slate-800 focus:border-sky-500 focus:ring-sky-200"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${
                          darkMode ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        Contact phone
                      </label>
                      <input
                        value={trustedContactDraftPhone}
                        onChange={(event) => setTrustedContactDraftPhone(event.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                          darkMode
                            ? "border-slate-500 bg-slate-700 text-slate-100 focus:border-slate-200 focus:ring-slate-500"
                            : "border-sky-300 bg-white text-slate-800 focus:border-sky-500 focus:ring-sky-200"
                        }`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTrustedContactName(trustedContactDraftName.trim());
                          setTrustedContactPhone(trustedContactDraftPhone.trim());
                          setIsEditingTrustedContact(false);
                        }}
                        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTrustedContactDraftName(trustedContactName);
                          setTrustedContactDraftPhone(trustedContactPhone);
                          setIsEditingTrustedContact(false);
                        }}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                          darkMode
                            ? "border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600"
                            : "border-sky-300 bg-white text-slate-700 hover:bg-sky-50"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-xl border p-4 ${
                      darkMode ? "border-slate-500 bg-slate-700" : "border-sky-200 bg-sky-50"
                    }`}
                  >
                    <p className={`font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                      {trustedContactName || "Not set"}
                    </p>
                    <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {trustedContactPhone || "No phone yet"}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <button
                  className={`rounded-2xl border p-5 text-left ${
                    darkMode
                      ? "border-slate-600 bg-slate-800/90 hover:bg-slate-700"
                      : "border-sky-300 bg-white/90 hover:bg-sky-50"
                  }`}
                >
                  <p className={`font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Blocked users</p>
                  <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                    Manage your block list and mute actions.
                  </p>
                </button>
                <button className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-left hover:bg-rose-100">
                  <p className="font-semibold text-rose-800">Report a problem</p>
                  <p className="text-sm text-rose-700">Report harassment or unsafe behavior.</p>
                </button>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"
                }`}
              >
                <h3 className={`mb-2 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  RLS Data Privacy
                </h3>
                <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  Private profile fields will be secured with Supabase Row Level Security once backend
                  integration is enabled.
                </p>
              </div>
            </div>
          )}

          {activeSection === "account" && (
            <div className="space-y-4">
              <div
                className={`rounded-2xl border p-5 ${
                  darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"
                }`}
              >
                <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  Membership Info
                </h3>
                <div className="space-y-3 text-sm">
                  <LineItem label="Current Village" value={MOCK_USER.community_name} darkMode={darkMode} />
                  <LineItem label="Membership Tier" value={MOCK_USER.membership_tier} darkMode={darkMode} />
                  <LineItem label="Member Since" value={MOCK_USER.membership_since} darkMode={darkMode} />
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"
                }`}
              >
                <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  Security
                </h3>
                <div className="space-y-3">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        darkMode ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      Email
                    </p>
                    <p className={`text-sm ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{MOCK_USER.email}</p>
                  </div>
                  <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
  darkMode,
}: {
  label: string;
  value: string;
  icon: string;
  darkMode: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"}`}>
      <p className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-500"}`}>
        <span className="mr-1" aria-hidden>
          {icon}
        </span>
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function LineItem({ label, value, darkMode }: { label: string; value: string; darkMode: boolean }) {
  return (
    <div
      className={`flex items-center justify-between border-b pb-2 last:border-b-0 ${
        darkMode ? "border-slate-700" : "border-sky-100"
      }`}
    >
      <span className={darkMode ? "text-slate-300" : "text-slate-500"}>{label}</span>
      <span className={darkMode ? "font-medium text-slate-100" : "font-medium text-slate-900"}>{value}</span>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
  darkMode,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 ${
        darkMode ? "border-slate-700" : "border-sky-100"
      }`}
    >
      <div className="pr-3">
        <p className={`text-sm font-medium ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{label}</p>
        <p className={`text-xs ${darkMode ? "text-slate-300" : "text-slate-500"}`}>{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${
          checked ? "bg-sky-600" : darkMode ? "bg-slate-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}