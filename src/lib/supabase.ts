import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// ── Lantern types ──────────────────────────────────────────────────────

export interface Lantern {
  id: string;
  mood_id: string;
  text: string;
  author_name: string;
  created_at: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  lantern_id: string;
  text: string;
  author_name: string;
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient:
  | ReturnType<typeof createBrowserClient>
  | null
  | undefined;

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to get current user profile
export async function getCurrentUserProfile() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,name,avatar_url,community_id,trusted_contact_name,trusted_contact_phone,notification_events,notification_village,notification_push,dark_mode,data_visibility,created_at,communities(name)")
      .eq("id", user.id)
      .single(),
    supabase
      .from("memberships")
      .select("role,created_at,community_id,communities(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  if (!profile) return null

  return {
    ...profile,
    email: user.email,
    membership: membership ? [membership] : [],
    membership_tier: membership?.role || 'Active Member',
    membership_since: membership?.created_at || profile.created_at,
  }
}

// Update profile function
export async function updateProfile(userId: string, updates: {
  name?: string
  avatar_url?: string
  trusted_contact_name?: string
  trusted_contact_phone?: string
}) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// Update settings function
export async function updateSettings(userId: string, settings: {
  notification_events?: boolean
  notification_village?: boolean
  notification_push?: boolean
  dark_mode?: boolean
  data_visibility?: string
}) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const { data, error } = await supabase
    .from('profiles')
    .update(settings)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// Update trusted contact function
export async function updateTrustedContact(userId: string, contact: {
  trusted_contact_name: string
  trusted_contact_phone: string
}) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const { data, error } = await supabase
    .from('profiles')
    .update({
      trusted_contact_name: contact.trusted_contact_name,
      trusted_contact_phone: contact.trusted_contact_phone,
    })
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// Get user's community
export async function getUserCommunity(userId: string) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const { data, error } = await supabase
    .from('profiles')
    .select('community:communities(*)')
    .eq('id', userId)
    .single()

  return { data, error }
}

// Get user's events
export async function getUserEvents(userId: string) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const { data, error } = await supabase
    .from('rsvps')
    .select(`
      *,
      event:events(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get community members
export async function getCommunityMembers(communityId: string) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('community_id', communityId)

  return { data, error }
}

// ── Mock lanterns ──────────────────────────────────────────────────────

const mockLanterns: Lantern[] = [
  { id: "l1", mood_id: "cozy", text: "wrapped in a blanket watching rain", author_name: "ember", created_at: "2026-02-11T08:30:00Z", replies: [{ id: "r1", lantern_id: "l1", text: "that sounds so peaceful", author_name: "willow", created_at: "2026-02-11T09:00:00Z" }] },
  { id: "l2", mood_id: "anxious", text: "cant stop thinking about tomorrow", author_name: "cloud", created_at: "2026-02-11T07:15:00Z", replies: [] },
  { id: "l3", mood_id: "focused", text: "deep in the code zone right now", author_name: "pixel", created_at: "2026-02-11T06:00:00Z", replies: [{ id: "r2", lantern_id: "l3", text: "you got this!", author_name: "sage", created_at: "2026-02-11T06:30:00Z" }] },
  { id: "l4", mood_id: "low-energy", text: "everything feels heavy today", author_name: "moth", created_at: "2026-02-11T05:45:00Z", replies: [] },
  { id: "l5", mood_id: "social", text: "had the best coffee chat with a friend", author_name: "fern", created_at: "2026-02-11T04:20:00Z", replies: [{ id: "r3", lantern_id: "l5", text: "those moments are the best", author_name: "ember", created_at: "2026-02-11T04:50:00Z" }] },
  { id: "l6", mood_id: "cozy", text: "baking cookies and the house smells amazing", author_name: "honey", created_at: "2026-02-11T03:30:00Z", replies: [] },
  { id: "l7", mood_id: "anxious", text: "waiting for results is the worst part", author_name: "drift", created_at: "2026-02-11T02:00:00Z", replies: [{ id: "r4", lantern_id: "l7", text: "sending good vibes your way", author_name: "cloud", created_at: "2026-02-11T02:30:00Z" }] },
  { id: "l8", mood_id: "focused", text: "finally understanding this concept", author_name: "nova", created_at: "2026-02-10T23:00:00Z", replies: [] },
  { id: "l9", mood_id: "social", text: "game night with the crew tonight", author_name: "spark", created_at: "2026-02-10T22:00:00Z", replies: [{ id: "r5", lantern_id: "l9", text: "what are you playing?", author_name: "pixel", created_at: "2026-02-10T22:15:00Z" }] },
  { id: "l10", mood_id: "low-energy", text: "just need to rest for a while", author_name: "mist", created_at: "2026-02-10T21:30:00Z", replies: [] },
  { id: "l11", mood_id: "cozy", text: "listening to lo-fi and sketching", author_name: "ink", created_at: "2026-02-10T20:00:00Z", replies: [{ id: "r6", lantern_id: "l11", text: "share what you draw!", author_name: "fern", created_at: "2026-02-10T20:30:00Z" }] },
  { id: "l12", mood_id: "anxious", text: "too many tabs open in my brain", author_name: "static", created_at: "2026-02-10T19:00:00Z", replies: [] },
  { id: "l13", mood_id: "focused", text: "three hours flew by like nothing", author_name: "zen", created_at: "2026-02-10T18:00:00Z", replies: [{ id: "r7", lantern_id: "l13", text: "flow state is magic", author_name: "nova", created_at: "2026-02-10T18:30:00Z" }] },
  { id: "l14", mood_id: "social", text: "strangers smiled at me today and it helped", author_name: "petal", created_at: "2026-02-10T17:00:00Z", replies: [] },
  { id: "l15", mood_id: "low-energy", text: "running on empty but still here", author_name: "ash", created_at: "2026-02-10T16:00:00Z", replies: [{ id: "r8", lantern_id: "l15", text: "proud of you for showing up", author_name: "moth", created_at: "2026-02-10T16:30:00Z" }] },
];

const lanterns = [...mockLanterns];

// ── Lantern CRUD ───────────────────────────────────────────────────────

export async function getAllLanterns(): Promise<Lantern[]> {
  if (supabase) {
    const { data } = await supabase
      .from("lanterns")
      .select("*, replies(*)")
      .order("created_at", { ascending: false });
    if (data) return data;
  }
  return [...lanterns].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function createLantern(
  lantern: Omit<Lantern, "id" | "created_at" | "replies">
): Promise<Lantern> {
  const newLantern: Lantern = {
    ...lantern,
    id: `l${Date.now()}`,
    created_at: new Date().toISOString(),
    replies: [],
  };
  if (supabase) {
    const { data } = await supabase
      .from("lanterns")
      .insert(newLantern)
      .select()
      .single();
    if (data) return data;
  }
  lanterns.unshift(newLantern);
  return newLantern;
}

export async function createReply(
  reply: Omit<Reply, "id" | "created_at">
): Promise<Reply> {
  const newReply: Reply = {
    ...reply,
    id: `r${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  if (supabase) {
    const { data } = await supabase
      .from("replies")
      .insert(newReply)
      .select()
      .single();
    if (data) return data;
  }
  const target = lanterns.find((l) => l.id === reply.lantern_id);
  if (target) {
    if (!target.replies) target.replies = [];
    target.replies.push(newReply);
  }
  return newReply;
}

export async function getConversationCount(lanternId: string): Promise<number> {
  if (supabase) {
    const { count } = await supabase
      .from("replies")
      .select("*", { count: "exact", head: true })
      .eq("lantern_id", lanternId);
    return count || 0;
  }
  const target = lanterns.find((l) => l.id === lanternId);
  return target?.replies?.length || 0;
}
