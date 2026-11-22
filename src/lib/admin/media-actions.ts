'use server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { MEDIA_CATEGORIES } from '@/lib/validation/media'

export type PickerMedia = { id: string; url: string; alt: string | null; category: string; width: number | null; height: number | null; mime: string | null }

const PAGE = 24
const querySchema = z.object({
  q: z.string().trim().max(100).default(''),
  category: z.enum(MEDIA_CATEGORIES).nullish(),
  offset: z.number().int().min(0).max(100_000).default(0),
})

type Row = { id: string; storage_path: string; bucket: string; alt: string | null; category: string; width: number | null; height: number | null; mime_type: string | null }
const COLS = 'id, storage_path, bucket, alt, category, width, height, mime_type'

async function toPicker(rows: Row[]): Promise<PickerMedia[]> {
  const db = await createServerClient()
  return rows.map((r) => ({
    id: r.id,
    url: db.storage.from(r.bucket).getPublicUrl(r.storage_path).data.publicUrl,
    alt: r.alt,
    category: r.category,
    width: r.width,
    height: r.height,
    mime: r.mime_type,
  }))
}

/** Admin-only: browse media_assets for the MediaPicker (newest first). */
export async function listMediaForPicker(input: unknown): Promise<{ items: PickerMedia[]; hasMore: boolean; error?: string }> {
  await requireAdmin()
  const parsed = querySchema.safeParse(input ?? {})
  if (!parsed.success) return { items: [], hasMore: false, error: 'Invalid query' }
  const { q, category, offset } = parsed.data
  const db = await createServerClient()
  let query = db.from('media_assets').select(COLS).order('created_at', { ascending: false }).range(offset, offset + PAGE)
  if (category) query = query.eq('category', category)
  if (q) {
    // Strip PostgREST filter metacharacters from the search term.
    const safe = q.replace(/[%,()*\\]/g, ' ')
    query = query.or(`alt.ilike.%${safe}%,caption.ilike.%${safe}%,storage_path.ilike.%${safe}%`)
  }
  const { data, error } = await query
  if (error) return { items: [], hasMore: false, error: 'Could not load media' }
  const rows = (data ?? []) as Row[]
  return { items: await toPicker(rows.slice(0, PAGE)), hasMore: rows.length > PAGE }
}

/** Admin-only: resolve one media id for the picker preview. */
export async function getMediaForPicker(id: string): Promise<PickerMedia | null> {
  await requireAdmin()
  if (!z.string().uuid().safeParse(id).success) return null
  const db = await createServerClient()
  const { data } = await db.from('media_assets').select(COLS).eq('id', id).maybeSingle()
  return data ? (await toPicker([data as Row]))[0]! : null
}
