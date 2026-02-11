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

export function getDefaultAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || "MoodVillageUser")}`;
}

export async function uploadAvatarImage(
  client: NonNullable<ReturnType<typeof createBrowserSupabaseClient>>,
  userId: string,
  file: File,
) {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await client.storage.from("avatars").upload(filePath, file, {
    upsert: true,
    contentType: file.type || "image/png",
  });

  if (uploadError) {
    if (/bucket not found/i.test(uploadError.message || "")) {
      return {
        data: null,
        error: new Error(
          "Avatar upload is not configured yet. Supabase Storage bucket 'avatars' is missing. Run supabase/profile_auth_schema.sql in your Supabase SQL editor.",
        ),
      };
    }
    return { data: null, error: uploadError };
  }

  const { data } = client.storage.from("avatars").getPublicUrl(filePath);
  return { data: { publicUrl: data.publicUrl }, error: null };
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function getSupabaseErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

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

export interface Lantern {
  id: string;
  mood_id: string;
  content: string;
  created_at: string;
  author?: string | null;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  lantern_id: string;
  content: string;
  created_at: string;
}

// Mock data for demo
const mockLanterns: Lantern[] = [
  {
    id: '1',
    mood_id: 'anxious',
    content: 'Pacing, need distraction ideas',
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    author: 'Sarah',
  },
  {
    id: '2',
    mood_id: 'cozy',
    content: 'Tea cooling. Rain sounds. Finally exhaling',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    author: 'Alex',
  },
  {
    id: '3',
    mood_id: 'focused',
    content: 'Flow state. Time disappeared. Still going',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    author: 'Jordan',
  },
  {
    id: '4',
    mood_id: 'social',
    content: 'Coffee shop buzz. Overheard something beautiful',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    author: 'Morgan',
  },
  {
    id: '5',
    mood_id: 'low-energy',
    content: 'Couch gravity strong today. No plans',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    author: 'Casey',
  },
  {
    id: '6',
    mood_id: 'cozy',
    content: 'Blanket fort. Fairy lights. Childhood comfort',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    author: 'Riley',
  },
  {
    id: '7',
    mood_id: 'anxious',
    content: 'Heart racing. Lists not helping. Just writing',
    created_at: new Date(Date.now() - 7 * 3600000).toISOString(),
    author: 'Quinn',
  },
  {
    id: '8',
    mood_id: 'focused',
    content: 'Headphones on. Door closed. Deep work mode',
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    author: 'Avery',
  },
  {
    id: '9',
    mood_id: 'social',
    content: 'Met someone who gets it. Still smiling',
    created_at: new Date(Date.now() - 9 * 3600000).toISOString(),
    author: 'Taylor',
  },
  {
    id: '10',
    mood_id: 'low-energy',
    content: 'Everything feels heavy. Tomorrow maybe',
    created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    author: 'Drew',
  },
  {
    id: '11',
    mood_id: 'cozy',
    content: 'Candles. Book. Nothing else matters right now',
    created_at: new Date(Date.now() - 11 * 3600000).toISOString(),
    author: 'Sam',
  },
  {
    id: '12',
    mood_id: 'anxious',
    content: 'Too many tabs open. Brain matching',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    author: 'Blake',
  },
  {
    id: '13',
    mood_id: 'focused',
    content: 'Solved it. Three hours straight. Worth it',
    created_at: new Date(Date.now() - 13 * 3600000).toISOString(),
    author: 'Charlie',
  },
  {
    id: '14',
    mood_id: 'social',
    content: 'Laughter echoing. Room full of good energy',
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    author: 'Reese',
  },
  {
    id: '15',
    mood_id: 'low-energy',
    content: 'Ceiling watching. Mind empty. Body still',
    created_at: new Date(Date.now() - 15 * 3600000).toISOString(),
    author: 'Skyler',
  },
];

// In-memory storage for demo
let localLanterns = [...mockLanterns];
let localReplies: Reply[] = [];
let conversationCount = 12;

export async function getAllLanterns(): Promise<Lantern[]> {
  if (!supabase) return localLanterns;
  const { data, error } = await supabase
    .from('lanterns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      `Unable to load lanterns from Supabase. Apply the lantern schema and policies, then retry. (${getSupabaseErrorMessage(error, 'unknown error')})`,
    );
  }

  return data || [];
}

type LanternInsert = {
  mood_id: string;
  content: string;
  author?: string | null;
};

export async function createLantern(lantern: LanternInsert): Promise<Lantern> {
  if (!supabase) {
    const newLantern: Lantern = {
      id: Date.now().toString(),
      ...lantern,
      created_at: new Date().toISOString(),
    };
    localLanterns = [newLantern, ...localLanterns];
    return newLantern;
  }

  const { data, error } = await supabase
    .from('lanterns')
    .insert([lantern])
    .select()
    .single();

  if (error) {
    throw new Error(
      `Unable to release lantern to Supabase. Apply the lantern schema and check RLS insert policy. (${getSupabaseErrorMessage(error, 'unknown error')})`,
    );
  }

  if (!data) {
    // Insert likely succeeded but row representation was blocked by RLS/select policy.
    return {
      id: Date.now().toString(),
      mood_id: lantern.mood_id,
      content: lantern.content,
      author: lantern.author ?? null,
      created_at: new Date().toISOString(),
    };
  }

  return data;
}

export async function createReply(reply: Omit<Reply, 'id' | 'created_at'>): Promise<Reply> {
  if (!supabase) {
    const newReply: Reply = {
      id: Date.now().toString(),
      ...reply,
      created_at: new Date().toISOString(),
    };
    localReplies = [newReply, ...localReplies];
    conversationCount++;
    return newReply;
  }
  try {
    const { data, error } = await supabase
      .from('replies')
      .insert([reply])
      .select()
      .single();
    
    if (error) throw error;
    conversationCount++;
    return data;
  } catch {
    const newReply: Reply = {
      id: Date.now().toString(),
      ...reply,
      created_at: new Date().toISOString(),
    };
    localReplies = [newReply, ...localReplies];
    conversationCount++;
    return newReply;
  }
}

export async function getRepliesForLantern(lanternId: string): Promise<Reply[]> {
  if (!supabase) {
    return localReplies
      .filter((reply) => reply.lantern_id === lanternId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  const { data, error } = await supabase
    .from("replies")
    .select("id,lantern_id,content,created_at")
    .eq("lantern_id", lanternId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `Unable to load replies for this lantern. Check replies table schema/policies. (${getSupabaseErrorMessage(error, "unknown error")})`,
    );
  }

  return data ?? [];
}

export function getConversationCount(): number {
  return conversationCount;
}
