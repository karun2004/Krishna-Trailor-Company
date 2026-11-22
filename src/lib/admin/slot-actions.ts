'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { SLOT_BY_ID } from '@/lib/media-slots'
import { createServerClient } from '@/lib/supabase/server'
import type { ActionResult } from './fields'

const input = z.object({ slotId: z.string().max(80), mediaId: z.string().uuid().nullable() })

/** Assigns (or clears) the media shown in one named site container. Creates the page_content row on first use. */
export async function saveSlot(slotId: string, mediaId: string | null): Promise<ActionResult> {
  await requireAdmin()
  const parsed = input.safeParse({ slotId, mediaId })
  const slot = parsed.success ? SLOT_BY_ID.get(parsed.data.slotId) : undefined
  if (!parsed.success || !slot) return { ok: false, error: 'Unknown image slot' }
  const db = await createServerClient()
  const { data: row, error: readErr } = await db
    .from('page_content').select('id, published, content').eq('page_key', slot.page).eq('block_key', slot.block).maybeSingle()
  if (readErr) return { ok: false, error: 'Could not save. Please try again.' }
  if (row) {
    const emptyContent = !row.content || Object.keys(row.content as object).length === 0
    const patch: Record<string, unknown> = { media_id: parsed.data.mediaId }
    // A slot-only row (no copy) has nothing to hide; make sure it is live.
    if (emptyContent && !row.published) patch.published = true
    const { error } = await db.from('page_content').update(patch).eq('id', row.id)
    if (error) return { ok: false, error: 'Could not save. Please try again.' }
  } else {
    const { error } = await db.from('page_content').insert({
      page_key: slot.page, block_key: slot.block, content: {}, media_id: parsed.data.mediaId, published: true, sort_order: 100,
    })
    if (error) return { ok: false, error: 'Could not save. Please try again.' }
  }
  revalidatePath('/admin/page-images')
  revalidatePath(slot.page === 'home' ? '/' : `/${slot.page}`)
  return { ok: true }
}
