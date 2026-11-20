'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { testimonialSchema } from './schema'

const a = createEntityActions({
  table: 'testimonials',
  schema: testimonialSchema,
  revalidate: ['/admin/testimonials', '/'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveTestimonial(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setTestimonialPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderTestimonials(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
