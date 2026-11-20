'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { milestoneSchema } from './schema'

const a = createEntityActions({
  table: 'timeline_milestones',
  schema: milestoneSchema,
  revalidate: ['/admin/timeline', '/about', '/'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveMilestone(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setMilestonePublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteMilestone(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderTimeline(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
