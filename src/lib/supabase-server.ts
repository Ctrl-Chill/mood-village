import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type RouteAuth = {
  userId: string | null;
  supabase: ReturnType<typeof createServerClient> | null;
};

export async function getRouteAuth(): Promise<RouteAuth> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { userId: null, supabase: null };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { userId: user?.id ?? null, supabase };
}
