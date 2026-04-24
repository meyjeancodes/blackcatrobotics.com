import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * SSR Supabase client — reads auth cookies from the request.
 * Returns null if env vars are missing (graceful degradation).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component context — cookies are read-only
          }
        },
      },
    }
  );
}

/**
 * Returns true if both Supabase anon-key + URL env vars are configured.
 * Used by server components and API routes to detect offline mode.
 */
export function isSupabaseServerConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
