'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { blockSchema } from './schema'

const a = createEntityActions({
  table: 'page_content',
  schema: blockSchema,
  revalidate: ['/admin/homepage', '/'],
  hasSortOrder: false,
})

export async function saveBlock(id: string, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setBlockPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
