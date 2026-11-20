'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { projectSchema } from './schema'

const a = createEntityActions({
  table: 'projects',
  schema: projectSchema,
  revalidate: ['/admin/projects', '/projects', '/'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveProject(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setProjectPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteProject(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderProjects(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
