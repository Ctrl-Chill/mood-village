import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

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
