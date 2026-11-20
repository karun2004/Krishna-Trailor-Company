'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/lib/admin/fields'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

const uuid = z.string().uuid()
const phase = z.enum(['before', 'during', 'after'])
const caption = z.string().trim().max(300).nullable().transform((v) => v || null)
const fail = (error = 'Could not save. Please try again.'): ActionResult => ({ ok: false, error })
const done = (projectId?: string) => {
  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  if (projectId) revalidatePath(`/admin/projects/${projectId}`)
}

export async function addProjectImage(projectId: string, mediaId: string, tag: string | undefined): Promise<ActionResult> {
  await requireAdmin()
  const p = z.object({ projectId: uuid, mediaId: uuid, tag: phase }).safeParse({ projectId, mediaId, tag })
  if (!p.success) return fail('Invalid input')
  const db = await createServerClient()
  const { data: last } = await db.from('project_images').select('sort_order').eq('project_id', projectId).order('sort_order', { ascending: false }).limit(1)
  const sort = ((last?.[0] as { sort_order?: number } | undefined)?.sort_order ?? -1) + 1
  const { error } = await db.from('project_images').insert({ project_id: projectId, media_id: mediaId, phase: p.data.tag, sort_order: sort })
  if (error) return fail(error.code === '23503' ? 'That project or image no longer exists' : undefined)
  done(projectId)
  return { ok: true }
}

export async function updateProjectImage(id: string, values: { caption: string | null; phase?: string }): Promise<ActionResult> {
  await requireAdmin()
  const p = z.object({ id: uuid, caption, phase: phase.optional() }).safeParse({ id, caption: values?.caption ?? null, phase: values?.phase })
  if (!p.success) return fail('Invalid input')
  const patch: Record<string, unknown> = { caption: p.data.caption }
  if (p.data.phase) patch.phase = p.data.phase
  const db = await createServerClient()
  const { data, error } = await db.from('project_images').update(patch).eq('id', p.data.id).select('id, project_id')
  if (error) return fail()
  if (!data?.length) return fail('Record not found')
  done((data[0] as { project_id: string }).project_id)
  return { ok: true }
}

export async function removeProjectImage(id: string): Promise<ActionResult> {
  await requireAdmin()
  if (!uuid.safeParse(id).success) return fail('Invalid id')
  const db = await createServerClient()
  const { data, error } = await db.from('project_images').delete().eq('id', id).select('id, project_id')
  if (error) return fail()
  if (!data?.length) return fail('Record not found')
  done((data[0] as { project_id: string }).project_id)
  return { ok: true }
}

export async function reorderProjectImages(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin()
  const p = z.array(uuid).min(1).max(500).safeParse(orderedIds)
  if (!p.success || new Set(p.data).size !== p.data.length) return fail('Invalid order')
  const db = await createServerClient()
  const rs = await Promise.all(p.data.map((id, i) => db.from('project_images').update({ sort_order: i }).eq('id', id)))
  if (rs.some((r) => r.error)) return fail()
  done()
  return { ok: true }
}
