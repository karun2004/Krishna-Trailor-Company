'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { officeSchema } from './schema'

const a = createEntityActions({
  table: 'office_locations',
  schema: officeSchema,
  revalidate: ['/admin/offices', '/contact', '/'],
})

export async function saveOffice(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setOfficePublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteOffice(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderOffices(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
