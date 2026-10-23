import { createClient } from '@supabase/supabase-js';

// Service role client bypasses RLS for administrative and server API tasks
export function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or SUPABASE_SERVICE_ROLE_KEY is missing in environment variables. Refusing to operate with missing or insecure key.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
