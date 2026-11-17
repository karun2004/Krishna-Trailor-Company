import { createBrowserClient as createSsrBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export function createBrowserClient() {
  return createSsrBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
