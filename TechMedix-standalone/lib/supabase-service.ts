import { createClient } from "@supabase/supabase-js";


import { isSupabaseServerConfigured } from './supabase-server';

// Alias for compatibility — routes that use supabase-service also need server check
export { isSupabaseServerConfigured };
/**
 * Service-role Supabase client — bypasses Row Level Security.
 * SERVER-SIDE ONLY. Never import in client components.
 * Used by simulation, grid, and orchestration engines.
 *
 * Returns null if env vars are missing (graceful degradation).
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Returns true if both Supabase service-role env vars are configured.
 * Used by API routes to short-circuit to mock mode when keys are missing.
 */
export function isSupabaseServiceConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}