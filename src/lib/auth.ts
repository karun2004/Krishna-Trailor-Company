import 'server-only'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

export type AdminSession = { user: User }

/**
 * Returns the signed-in user only if (1) the session is valid (verified against
 * Supabase Auth via getUser(), not merely decoded from the cookie) and (2) a
 * profiles row with role = 'admin' exists for them. Any failure => null (fail closed).
 */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  // profiles RLS lets a user read only their own row.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()
  if (profileError || profile?.role !== 'admin') return null
  return data.user
}

/** For pages and Server Actions: redirects to the login page unless the caller is an admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  return { user }
}

export type AdminApiResult =
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse }

/**
 * For route handlers: call first, before any database work.
 *   const auth = await requireAdminApi()
 *   if (!auth.ok) return auth.response   // 401 JSON
 */
export async function requireAdminApi(): Promise<AdminApiResult> {
  const user = await getAdminUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ok: true, session: { user } }
}
