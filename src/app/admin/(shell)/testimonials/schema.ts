import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, uuidOrNull } from '@/lib/admin/schema'

export const testimonialSchema = z.object({
  author_name: requiredText('Author name'),
  author_role: optionalText(200),
  company: optionalText(200),
  quote: requiredText('Quote', 2000),
  division_id: uuidOrNull,
  approved: z.boolean(),
  published: z.boolean(),
  verification_note: optionalText(1000),
})

export function testimonialFields(divisions: { id: string; name: string }[]): Field[] {
  return [
    { type: 'text', name: 'author_name', label: 'Author name' },
    { type: 'text', name: 'author_role', label: 'Author role' },
    { type: 'text', name: 'company', label: 'Company' },
    { type: 'textarea', name: 'quote', label: 'Quote', rows: 5 },
    { type: 'select', name: 'division_id', label: 'Division', emptyLabel: 'No division', options: divisions.map((d) => ({ value: d.id, label: d.name })) },
    { type: 'boolean', name: 'approved', label: 'Approved', help: 'The author has approved this wording.' },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only publish approved testimonials.' },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only.' },
  ]
}
