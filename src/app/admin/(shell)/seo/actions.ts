'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { seoSchema } from './schema'

const a = createEntityActions({
  table: 'seo_metadata',
  schema: seoSchema,
  revalidate: ['/admin/seo', '/'],
})

export async function saveSeo(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setSeoPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteSeo(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderSeo(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
