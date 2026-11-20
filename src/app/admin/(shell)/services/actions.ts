'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { serviceSchema } from './schema'

const a = createEntityActions({
  table: 'services',
  schema: serviceSchema,
  revalidate: ['/admin/services', '/services', '/'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveService(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setServicePublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteService(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderServices(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
