import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { bad } from '../../_lib'

export const runtime = 'nodejs'

/** Lists every record referencing this asset (single SQL function over all media FKs). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response
  const { id } = await params
  if (!z.uuid().safeParse(id).success) return bad('Invalid id.')
  const { data, error } = await createAdminClient().rpc('media_usage', { p_media_id: id })
  if (error) return bad('Could not look up usage.', 500)
  return NextResponse.json({ usage: data ?? [] })
}
