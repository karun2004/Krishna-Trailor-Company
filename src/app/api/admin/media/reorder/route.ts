import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { bad } from '../_lib'

export const runtime = 'nodejs'

const bodySchema = z.object({ ids: z.array(z.uuid()).min(1).max(1000) })

/** Persists library order: sort_order = index in `ids`. */
export async function POST(req: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return bad('Expected { ids: uuid[] }.')
  const ids = parsed.data.ids
  if (new Set(ids).size !== ids.length) return bad('Duplicate ids.')
  const admin = createAdminClient()
  const results = await Promise.all(
    ids.map((id, i) => admin.from('media_assets').update({ sort_order: i }).eq('id', id)),
  )
  if (results.some((r) => r.error)) return bad('Could not save order.', 500)
  return NextResponse.json({ ok: true })
}
