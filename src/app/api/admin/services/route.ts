import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'

/**
 * Services are mutated through Server Actions (src/app/admin/(shell)/services/actions.ts).
 * This endpoint stays admin-gated (401 without an admin session) and is not a create API.
 */
export async function POST() {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response
  return NextResponse.json({ error: 'Use the admin services screen' }, { status: 405 })
}
