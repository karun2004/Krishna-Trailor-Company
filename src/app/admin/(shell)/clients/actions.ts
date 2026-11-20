'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { clientSchema } from './schema'

const a = createEntityActions({
  table: 'client_logos',
  schema: clientSchema,
  revalidate: ['/admin/clients', '/'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveClient(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setClientPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteClient(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderClients(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
