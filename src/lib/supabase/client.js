import { createBrowserClient } from '@supabase/ssr';

let client = null;

/**
 * Returns a singleton Supabase client for browser usage.
 * Falls back to demo mode if env vars are not set.
 */
export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}

/**
 * Check if we're running in demo mode (no Supabase configured).
 */
export function isDemoMode() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
