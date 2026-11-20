'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { fleetItemSchema } from './schema'

const a = createEntityActions({
  table: 'fleet_items',
  schema: fleetItemSchema,
  revalidate: ['/admin/fleet', '/fleet', '/'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveFleetItem(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setFleetItemPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteFleetItem(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderFleet(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
