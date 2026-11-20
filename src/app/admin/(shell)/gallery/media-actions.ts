'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/lib/admin/fields'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

const uuid = z.string().uuid()
const caption = z.string().trim().max(300).nullable().transform((v) => v || null)
const fail = (error = 'Could not save. Please try again.'): ActionResult => ({ ok: false, error })
const done = (albumId?: string) => {
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  if (albumId) revalidatePath(`/admin/gallery/${albumId}`)
}

export async function addAlbumMedia(albumId: string, mediaId: string): Promise<ActionResult> {
  await requireAdmin()
  const p = z.object({ albumId: uuid, mediaId: uuid }).safeParse({ albumId, mediaId })
  if (!p.success) return fail('Invalid input')
  const db = await createServerClient()
  const { data: last } = await db.from('gallery_album_media').select('sort_order').eq('album_id', albumId).order('sort_order', { ascending: false }).limit(1)
  const sort = ((last?.[0] as { sort_order?: number } | undefined)?.sort_order ?? -1) + 1
  const { error } = await db.from('gallery_album_media').insert({ album_id: albumId, media_id: mediaId, sort_order: sort })
  if (error) return fail(error.code === '23505' ? 'That image is already in this album' : error.code === '23503' ? 'That album or image no longer exists' : undefined)
  done(albumId)
  return { ok: true }
}

export async function updateAlbumMedia(id: string, values: { caption: string | null }): Promise<ActionResult> {
  await requireAdmin()
  const p = z.object({ id: uuid, caption }).safeParse({ id, caption: values?.caption ?? null })
  if (!p.success) return fail('Invalid input')
  const db = await createServerClient()
  const { data, error } = await db.from('gallery_album_media').update({ caption: p.data.caption }).eq('id', p.data.id).select('id, album_id')
  if (error) return fail()
  if (!data?.length) return fail('Record not found')
  done((data[0] as { album_id: string }).album_id)
  return { ok: true }
}

export async function removeAlbumMedia(id: string): Promise<ActionResult> {
  await requireAdmin()
  if (!uuid.safeParse(id).success) return fail('Invalid id')
  const db = await createServerClient()
  const { data, error } = await db.from('gallery_album_media').delete().eq('id', id).select('id, album_id')
  if (error) return fail()
  if (!data?.length) return fail('Record not found')
  done((data[0] as { album_id: string }).album_id)
  return { ok: true }
}

export async function reorderAlbumMedia(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin()
  const p = z.array(uuid).min(1).max(500).safeParse(orderedIds)
  if (!p.success || new Set(p.data).size !== p.data.length) return fail('Invalid order')
  const db = await createServerClient()
  const rs = await Promise.all(p.data.map((id, i) => db.from('gallery_album_media').update({ sort_order: i }).eq('id', id)))
  if (rs.some((r) => r.error)) return fail()
  done()
  return { ok: true }
}
