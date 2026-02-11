"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBrowserSupabaseClient,
  getDefaultAvatar,
  uploadAvatarImage,
} from "@/lib/supabase";

type SectionId = "overview" | "settings" | "safety" | "account";
type Visibility = "everyone" | "friends" | "private";

type ProfileViewModel = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  communityName: string;
  trustedContactName: string;
  trustedContactPhone: string;
  joinedMoodVillage: string;
};

const THEME_STORAGE_KEY = "mood-village-theme";

const MOCK_PROFILE: ProfileViewModel = {
  id: "user-001",
  name: "Sarah Chen",
  email: "sarah.chen@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  communityName: "Mood Village",
  trustedContactName: "Jane Smith",
  trustedContactPhone: "+1 (555) 123-4567",
  joinedMoodVillage: "January 2025",
};

const sections: Array<{ id: SectionId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "settings", label: "Settings" },
  { id: "safety", label: "Safety" },
  { id: "account", label: "Account" },
];

function formatJoinedDate(value?: string | null) {
  if (!value) return MOCK_PROFILE.joinedMoodVillage;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return MOCK_PROFILE.joinedMoodVillage;
  return dt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const hasSupabase = Boolean(supabase);

  const [profile, setProfile] = useState<ProfileViewModel>(MOCK_PROFILE);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingTrustedContact, setIsSavingTrustedContact] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [eventNotifications, setEventNotifications] = useState(true);
  const [villageNotifications, setVillageNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dataVisibility, setDataVisibility] = useState<Visibility>("friends");

  const [trustedContactDraftName, setTrustedContactDraftName] = useState(profile.trustedContactName);
  const [trustedContactDraftPhone, setTrustedContactDraftPhone] = useState(profile.trustedContactPhone);
  const [isEditingTrustedContact, setIsEditingTrustedContact] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dark") setDarkMode(true);
    if (storedTheme === "light") setDarkMode(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileFromSupabase() {
      if (!supabase) {
        setIsLoadingProfile(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (!cancelled) {
          setIsAuthorized(false);
          setIsLoadingProfile(false);
          router.replace("/login");
        }
        return;
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select(
          "id,name,email,avatar_url,trusted_contact_name,trusted_contact_phone,created_at,notification_events,notification_village,notification_push,dark_mode,data_visibility,communities(name)",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const nextProfile: ProfileViewModel = {
        id: profileRow?.id ?? user.id,
        name: profileRow?.name ?? user.user_metadata?.name ?? MOCK_PROFILE.name,
        email: profileRow?.email ?? user.email ?? MOCK_PROFILE.email,
        avatar:
          profileRow?.avatar_url ??
          user.user_metadata?.avatar_url ??
          getDefaultAvatar(profileRow?.name ?? user.email ?? "MoodVillageUser"),
        communityName: profileRow?.communities?.name ?? MOCK_PROFILE.communityName,
        trustedContactName: profileRow?.trusted_contact_name ?? "",
        trustedContactPhone: profileRow?.trusted_contact_phone ?? "",
        joinedMoodVillage: formatJoinedDate(profileRow?.created_at ?? user.created_at ?? null),
      };

      setProfile(nextProfile);
      setIsAuthorized(true);
      setTrustedContactDraftName(nextProfile.trustedContactName);
      setTrustedContactDraftPhone(nextProfile.trustedContactPhone);
      setEventNotifications(profileRow?.notification_events ?? true);
      setVillageNotifications(profileRow?.notification_village ?? true);
      setPushNotifications(profileRow?.notification_push ?? false);
      setDarkMode(profileRow?.dark_mode ?? false);
      setDataVisibility((profileRow?.data_visibility as Visibility) ?? "friends");
      setIsLoadingProfile(false);
    }

    void loadProfileFromSupabase();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function upsertProfilePatch(patch: Record<string, unknown>) {
    if (!supabase) return { ok: false, message: "Supabase is not configured." };

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return { ok: false, message: "You are not logged in." };

    const baseName =
      profile.name?.trim() || user.user_metadata?.name || user.email?.split("@")[0] || "Member";

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        name: baseName,
        email: user.email ?? profile.email ?? null,
        ...patch,
      },
      { onConflict: "id" },
    );

    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Saved." };
  }

  async function handleSaveSettings() {
    setNotice(null);
    setIsSavingSettings(true);
    const result = await upsertProfilePatch({
      notification_events: eventNotifications,
      notification_village: villageNotifications,
      notification_push: pushNotifications,
      dark_mode: darkMode,
      data_visibility: dataVisibility,
    });
    setIsSavingSettings(false);
    setNotice(result.message);
  }

  async function saveTrustedContact() {
    setNotice(null);
    setIsSavingTrustedContact(true);

    const nextName = trustedContactDraftName.trim();
    const nextPhone = trustedContactDraftPhone.trim();

    const result = await upsertProfilePatch({
      trusted_contact_name: nextName || null,
      trusted_contact_phone: nextPhone || null,
    });

    if (result.ok) {
      setProfile((current) => ({
        ...current,
        trustedContactName: nextName,
        trustedContactPhone: nextPhone,
      }));
      setIsEditingTrustedContact(false);
    }

    setIsSavingTrustedContact(false);
    setNotice(result.message);
  }

  async function changeProfilePhoto(file: File | null) {
    if (!file || !supabase) return;
    setNotice(null);
    setIsUploadingAvatar(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsUploadingAvatar(false);
      setNotice("You are not logged in.");
      return;
    }

    const uploaded = await uploadAvatarImage(supabase, user.id, file);
    if (uploaded.error) {
      setIsUploadingAvatar(false);
      setNotice(uploaded.error.message);
      return;
    }

    const avatarUrl = uploaded.data?.publicUrl;
    if (!avatarUrl) {
      setIsUploadingAvatar(false);
      setNotice("Could not get uploaded image URL.");
      return;
    }

    const saved = await upsertProfilePatch({ avatar_url: avatarUrl });
    if (saved.ok) {
      setProfile((current) => ({ ...current, avatar: avatarUrl }));
    }
    setNotice(saved.message);
    setIsUploadingAvatar(false);
  }

  const pageShell = darkMode
    ? "min-h-screen -mx-4 bg-slate-950 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    : "-mx-4 bg-transparent px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8";

  if (!hasSupabase) {
    return (
      <div className={pageShell}>
        <section className="mx-auto w-full max-w-6xl space-y-6 pb-12">
          <p className={darkMode ? "text-amber-200" : "text-amber-700"}>
            Supabase env vars are missing. Configure auth to access profile.
          </p>
        </section>
      </div>
    );
  }

  if (isLoadingProfile || !isAuthorized) {
    return (
      <div className={pageShell}>
        <section className="mx-auto w-full max-w-6xl space-y-6 pb-12">
          <p className={darkMode ? "text-slate-300" : "text-slate-600"}>Checking session...</p>
        </section>
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <section className="mx-auto w-full max-w-6xl space-y-6 pb-12">
        <header className="space-y-2">
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${darkMode ? "text-sky-300" : "text-sky-700/80"}`}>
            Account
          </p>
          <h1 className={`text-4xl font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Profile</h1>
          <p className={`max-w-2xl text-2xl leading-tight ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            Manage your user details, safety tools, and membership settings.
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
                className={`inline-flex min-w-28 items-center justify-center rounded-xl border px-4 py-2 text-center text-sm font-medium transition ${
                  activeSection === section.id
                    ? darkMode
                      ? "border-slate-100 bg-slate-100 text-slate-900"
                      : "border-sky-800 bg-sky-200 text-sky-900"
                    : darkMode
                      ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "border-sky-300 bg-white/80 text-slate-700 hover:bg-sky-100"
                }`}
              >
                <span className="text-center">{section.label}</span>
              </button>
            ))}
          </div>

          {notice ? (
            <p className={darkMode ? "mb-4 text-sm text-sky-200" : "mb-4 text-sm text-sky-700"}>{notice}</p>
          ) : null}

          {activeSection === "overview" && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-5 ${darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className={`h-[84px] w-[84px] rounded-full border-4 ${darkMode ? "border-slate-600 bg-slate-700" : "border-sky-100 bg-white"}`}
                  />
                  <div className="flex-1 space-y-2">
                    <h2 className={`text-2xl font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{profile.name}</h2>
                    <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{profile.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                        {profile.communityName}
                      </span>
                    </div>
                  </div>
                  <div className="w-full max-w-xs space-y-2">
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-slate-300" : "text-slate-500"}`}
                    >
                      Change profile photo
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => {
                        const selected = event.target.files?.[0] ?? null;
                        void changeProfilePhoto(selected);
                        event.currentTarget.value = "";
                      }}
                      className={`block w-full rounded-lg border px-3 py-2 text-sm ${
                        darkMode
                          ? "border-slate-500 bg-slate-700 text-slate-100"
                          : "border-sky-300 bg-white text-slate-800"
                      }`}
                      disabled={isUploadingAvatar}
                    />
                    <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {isUploadingAvatar ? "Uploading..." : "Upload PNG/JPG/WEBP/GIF."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <InfoCard label="User ID" value={profile.id} icon="ID" darkMode={darkMode} />
                <InfoCard label="Trusted Contact" value={profile.trustedContactName || "Not set"} icon="TC" darkMode={darkMode} />
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className={`rounded-2xl border p-5 ${darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"}`}>
                <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Notifications</h3>
                <div className="space-y-4">
                  <ToggleSetting label="Event notifications" description="Get updates on events and RSVPs" checked={eventNotifications} onChange={setEventNotifications} darkMode={darkMode} />
                  <ToggleSetting label="Village notifications" description="Receive updates from your village" checked={villageNotifications} onChange={setVillageNotifications} darkMode={darkMode} />
                  <ToggleSetting label="Push notifications" description="Allow mobile/browser push alerts" checked={pushNotifications} onChange={setPushNotifications} darkMode={darkMode} />
                </div>
              </div>

              <div className="space-y-4">
                <div className={`rounded-2xl border p-5 ${darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"}`}>
                  <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>App Theme</h3>
                  <ToggleSetting label="Dark mode" description="Switch between light and dark theme" checked={darkMode} onChange={setDarkMode} darkMode={darkMode} />
                </div>
                <div className={`rounded-2xl border p-5 ${darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"}`}>
                  <h3 className={`mb-3 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Privacy</h3>
                  <label className={`mb-2 block text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Profile visibility</label>
                  <select
                    value={dataVisibility}
                    onChange={(event) => setDataVisibility(event.target.value as Visibility)}
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
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  {isSavingSettings ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "safety" && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-5 ${darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"}`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Trusted Contact</h3>
                  {!isEditingTrustedContact ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTrustedContactDraftName(profile.trustedContactName);
                        setTrustedContactDraftPhone(profile.trustedContactPhone);
                        setIsEditingTrustedContact(true);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        darkMode ? "border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600" : "border-sky-300 bg-white text-slate-700 hover:bg-sky-50"
                      }`}
                    >
                      Edit
                    </button>
                  ) : null}
                </div>

                <p className={`mb-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  Your trusted contact can be reached during emergencies.
                </p>

                {isEditingTrustedContact ? (
                  <div className="space-y-3">
                    <input
                      value={trustedContactDraftName}
                      onChange={(event) => setTrustedContactDraftName(event.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                        darkMode
                          ? "border-slate-500 bg-slate-700 text-slate-100 focus:border-slate-200 focus:ring-slate-500"
                          : "border-sky-300 bg-white text-slate-800 focus:border-sky-500 focus:ring-sky-200"
                      }`}
                      placeholder="Trusted contact name"
                    />
                    <input
                      value={trustedContactDraftPhone}
                      onChange={(event) => setTrustedContactDraftPhone(event.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                        darkMode
                          ? "border-slate-500 bg-slate-700 text-slate-100 focus:border-slate-200 focus:ring-slate-500"
                          : "border-sky-300 bg-white text-slate-800 focus:border-sky-500 focus:ring-sky-200"
                      }`}
                      placeholder="Trusted contact phone"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveTrustedContact}
                        disabled={isSavingTrustedContact}
                        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                      >
                        {isSavingTrustedContact ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTrustedContactDraftName(profile.trustedContactName);
                          setTrustedContactDraftPhone(profile.trustedContactPhone);
                          setIsEditingTrustedContact(false);
                        }}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                          darkMode ? "border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600" : "border-sky-300 bg-white text-slate-700 hover:bg-sky-50"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-xl border p-4 ${darkMode ? "border-slate-500 bg-slate-700" : "border-sky-200 bg-sky-50"}`}>
                    <p className={`font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{profile.trustedContactName || "Not set"}</p>
                    <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{profile.trustedContactPhone || "No phone yet"}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "account" && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-5 ${darkMode ? "border-slate-600 bg-slate-800/90" : "border-sky-300 bg-white/90"}`}>
                <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Security</h3>
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-slate-300" : "text-slate-500"}`}>Email</p>
                    <p className={`text-sm ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{profile.email}</p>
                  </div>
                  <LineItem label="Joined Mood Village" value={profile.joinedMoodVillage} darkMode={darkMode} />
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
    <div className={`flex items-center justify-between border-b pb-2 last:border-b-0 ${darkMode ? "border-slate-700" : "border-sky-100"}`}>
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
    <div className={`flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 ${darkMode ? "border-slate-700" : "border-sky-100"}`}>
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
        <span className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
