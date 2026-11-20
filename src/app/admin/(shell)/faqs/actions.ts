'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { fAQSchema } from './schema'

const a = createEntityActions({
  table: 'faqs',
  schema: fAQSchema,
  revalidate: ['/admin/faqs', '/faqs', '/'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveFAQ(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setFAQPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteFAQ(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderFAQs(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
