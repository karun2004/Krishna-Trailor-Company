import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, uuidOrNull } from '@/lib/admin/schema'

export const milestoneSchema = z.object({
  year: requiredText('Year', 20),
  title: requiredText('Title'),
  description: optionalText(2000),
  media_id: uuidOrNull,
  published: z.boolean(),
  verification_note: optionalText(1000),
})
export type MilestoneInput = z.infer<typeof milestoneSchema>

export function milestoneFields(): Field[] {
  return [
    { type: 'text', name: 'year', label: 'Year' },
    { type: 'text', name: 'title', label: 'Title' },
    { type: 'textarea', name: 'description', label: 'Description', rows: 4 },
    { type: 'media', name: 'media_id', label: 'Image' },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only published milestones appear on the public site.' },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only. Record what still needs confirming before publishing.' },
  ]
}
