import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/** Service-role client. Bypasses RLS: server-side use only, never import from client code. */
export function createAdminClient() {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. It is required to create the admin Supabase client.',
    )
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
