'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { divisionSchema } from './schema'

const a = createEntityActions({
  table: 'business_divisions',
  schema: divisionSchema,
  revalidate: ['/admin/divisions', '/divisions', '/'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveDivision(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setDivisionPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteDivision(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderDivisions(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
