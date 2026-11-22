'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import type { ActionResult } from './fields'
import { SECTION_PAGES } from './section-pages'


const input = z.object({
  page: z.enum(SECTION_PAGES.map((p) => p.key) as [string, ...string[]]),
  placement: z.enum(['top', 'bottom']),
  title: z.string().trim().max(120),
  body: z.string().trim().max(3000),
  mediaIds: z.array(z.string().uuid()).max(12),
  published: z.boolean(),
})

const pathOf = (page: string) => SECTION_PAGES.find((p) => p.key === page)?.path ?? '/'

/** Creates (id null) or updates a free-form section. Stored as a page_content row keyed `sec_<id>`. */
export async function saveSection(id: string | null, values: unknown): Promise<ActionResult> {
  await requireAdmin()
  const p = input.safeParse(values)
  if (!p.success) return { ok: false, error: 'Check the form: ' + (p.error.issues[0]?.message ?? 'invalid values') }
  const v = p.data
  if (!v.title && !v.body && v.mediaIds.length === 0) return { ok: false, error: 'Add a title, some text or at least one image or video.' }
  const db = await createServerClient()
  const content = { kind: 'section', placement: v.placement, title: v.title, body: v.body, media_ids: v.mediaIds }
  if (id) {
    if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'Unknown section' }
    const { error } = await db.from('page_content').update({ page_key: v.page, content, published: v.published }).eq('id', id).like('block_key', 'sec_%')
    if (error) return { ok: false, error: 'Could not save. Please try again.' }
  } else {
    const { data: last } = await db.from('page_content').select('sort_order').eq('page_key', v.page).order('sort_order', { ascending: false }).limit(1)
    const { error } = await db.from('page_content').insert({
      page_key: v.page, block_key: `sec_${crypto.randomUUID().slice(0, 8)}`, content, published: v.published, sort_order: ((last?.[0]?.sort_order as number | undefined) ?? 100) + 1,
    })
    if (error) return { ok: false, error: 'Could not save. Please try again.' }
  }
  revalidatePath('/admin/sections'); revalidatePath(pathOf(v.page))
  return { ok: true }
}

export async function deleteSection(id: string, page: string): Promise<ActionResult> {
  await requireAdmin()
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'Unknown section' }
  const db = await createServerClient()
  const { error } = await db.from('page_content').delete().eq('id', id).like('block_key', 'sec_%')
  if (error) return { ok: false, error: 'Could not delete.' }
  revalidatePath('/admin/sections'); revalidatePath(pathOf(page))
  return { ok: true }
}

const entity = z.object({ kind: z.enum(['fleet', 'service', 'division']), id: z.string().uuid(), mediaId: z.string().uuid().nullable() })
const ENTITY = {
  fleet: { table: 'fleet_items', col: 'main_media_id', paths: ['/', '/fleet', '/krishna-trailor', '/heavy-haulage', '/radhe-travels'] },
  service: { table: 'services', col: 'main_media_id', paths: ['/', '/krishna-trailor', '/heavy-haulage', '/radhe-travels'] },
  division: { table: 'business_divisions', col: 'hero_media_id', paths: ['/', '/krishna-trailor', '/radhe-travels'] },
} as const

/** Sets the picture of one fleet item, service or division card (the same field the entity's own form edits). */
export async function saveEntityMedia(kind: string, id: string, mediaId: string | null): Promise<ActionResult> {
  await requireAdmin()
  const p = entity.safeParse({ kind, id, mediaId })
  if (!p.success) return { ok: false, error: 'Unknown item' }
  const c = ENTITY[p.data.kind]
  const db = await createServerClient()
  const { error } = await db.from(c.table).update({ [c.col]: p.data.mediaId }).eq('id', p.data.id)
  if (error) return { ok: false, error: 'Could not save. Please try again.' }
  revalidatePath('/admin/page-images')
  c.paths.forEach((x) => revalidatePath(x))
  return { ok: true }
}
