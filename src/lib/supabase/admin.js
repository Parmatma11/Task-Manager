import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with service_role key for administrative tasks.
 * ONLY use this in Server Components, Route Handlers, or Server Actions.
 * NEVER expose this to the client.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase admin configuration missing');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
