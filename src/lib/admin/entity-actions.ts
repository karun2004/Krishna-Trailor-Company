import 'server-only'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { fieldErrors, type ActionResult } from './fields'

/** Only these tables can ever be mutated through the generic actions. */
export const ADMIN_TABLES = [
  'business_divisions',
  'services',
  'fleet_items',
  'projects',
  'project_images',
  'gallery_albums',
  'gallery_album_media',
  'timeline_milestones',
  'testimonials',
  'faqs',
  'client_logos',
  'office_locations',
  'page_content',
  'seo_metadata',
] as const
export type AdminTable = (typeof ADMIN_TABLES)[number]

export type EntityActionsConfig<T extends Record<string, unknown>> = {
  table: AdminTable
  schema: z.ZodType<T, unknown>
  /** Paths passed to revalidatePath after every successful mutation. */
  revalidate: string[]
  /** Table has a `published` column (default true). */
  hasPublished?: boolean
  /** Table has a `sort_order` column (default true). */
  hasSortOrder?: boolean
}

const idSchema = z.string().uuid()
const idsSchema = z.array(z.string().uuid()).min(1).max(500)
const MAX_ORDER_ITEMS = 500

type PgError = { code?: string; message: string; details?: string | null }

function dbFailure(err: PgError): Extract<ActionResult, { ok: false }> {
  if (err.code === '23505') {
    const col = /Key \((\w+)\)/.exec(err.details ?? '')?.[1]
    const msg = 'That value is already in use'
    return { ok: false, error: msg, fieldErrors: col ? { [col]: msg } : undefined }
  }
  if (err.code === '23503') return { ok: false, error: 'A referenced record no longer exists' }
  return { ok: false, error: 'Could not save. Please try again.' }
}

/**
 * Builds the Server Action implementations for one admin entity.
 * Every action calls requireAdmin() FIRST (redirects to /admin/login otherwise), validates its
 * input, runs under the authenticated admin's session client (RLS applies; never service role),
 * then revalidates paths. Wrap each in a 'use server' file (see services/actions.ts).
 */
export function createEntityActions<T extends Record<string, unknown>>(cfg: EntityActionsConfig<T>) {
  if (!(ADMIN_TABLES as readonly string[]).includes(cfg.table)) {
    throw new Error(`Table not allowed for admin actions: ${String(cfg.table)}`)
  }
  const { table, schema } = cfg
  const hasPublished = cfg.hasPublished ?? true
  const hasSortOrder = cfg.hasSortOrder ?? true
  const done = () => cfg.revalidate.forEach((p) => revalidatePath(p))

  /** id === null creates; otherwise updates that row. */
  async function save(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
    await requireAdmin()
    if (id !== null && !idSchema.safeParse(id).success) return { ok: false, error: 'Invalid id' }
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: 'Please fix the highlighted fields', fieldErrors: fieldErrors(parsed.error) }
    }
    const db = await createServerClient()
    const values: Record<string, unknown> = { ...parsed.data }
    // sort_order and published are managed by reorder/setPublished unless the schema owns them.
    if (id === null) {
      if (hasSortOrder && !('sort_order' in values)) {
        const { data } = await db.from(table).select('sort_order').order('sort_order', { ascending: false }).limit(1)
        values.sort_order = ((data?.[0] as { sort_order?: number } | undefined)?.sort_order ?? -1) + 1
      }
      const { data, error } = await db.from(table).insert(values).select('id').single()
      if (error) return dbFailure(error)
      done()
      return { ok: true, id: (data as { id: string }).id }
    }
    const { data, error } = await db.from(table).update(values).eq('id', id).select('id')
    if (error) return dbFailure(error)
    if (!data?.length) return { ok: false, error: 'Record not found' }
    done()
    return { ok: true, id }
  }

  async function setPublished(id: string, published: boolean): Promise<ActionResult> {
    await requireAdmin()
    if (!hasPublished) return { ok: false, error: 'Not supported' }
    if (!idSchema.safeParse(id).success || typeof published !== 'boolean') return { ok: false, error: 'Invalid input' }
    const db = await createServerClient()
    const { data, error } = await db.from(table).update({ published }).eq('id', id).select('id')
    if (error) return dbFailure(error)
    if (!data?.length) return { ok: false, error: 'Record not found' }
    done()
    return { ok: true }
  }

  async function remove(id: string): Promise<ActionResult> {
    await requireAdmin()
    if (!idSchema.safeParse(id).success) return { ok: false, error: 'Invalid id' }
    const db = await createServerClient()
    const { data, error } = await db.from(table).delete().eq('id', id).select('id')
    if (error) return dbFailure(error)
    if (!data?.length) return { ok: false, error: 'Record not found' }
    done()
    return { ok: true }
  }

  /** Persists the given order: sort_order = index in `orderedIds`. */
  async function reorder(orderedIds: string[]): Promise<ActionResult> {
    await requireAdmin()
    if (!hasSortOrder) return { ok: false, error: 'Not supported' }
    const parsed = idsSchema.safeParse(orderedIds)
    if (!parsed.success || new Set(parsed.data).size !== parsed.data.length || parsed.data.length > MAX_ORDER_ITEMS) {
      return { ok: false, error: 'Invalid order' }
    }
    const db = await createServerClient()
    const results = await Promise.all(
      parsed.data.map((rowId, i) => db.from(table).update({ sort_order: i }).eq('id', rowId)),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) return dbFailure(failed.error)
    done()
    return { ok: true }
  }

  return { save, setPublished, remove, reorder }
}
