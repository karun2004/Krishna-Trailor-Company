import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'

/** Stub: real create logic lands with the CRUD primitives (Task 11). */
export async function POST() {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
