import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, uuidOrNull } from '@/lib/admin/schema'

export const fAQSchema = z.object({
  question: requiredText('Question', 500),
  answer: requiredText('Answer', 5000),
  division_id: uuidOrNull,
  published: z.boolean(),
  verification_note: optionalText(1000),
})
export type FAQInput = z.infer<typeof fAQSchema>

export function fAQFields(divisions: { id: string; name: string }[]): Field[] {
  return [
    { type: 'text', name: 'question', label: 'Question' },
    { type: 'textarea', name: 'answer', label: 'Answer', rows: 5 },
    { type: 'select', name: 'division_id', label: 'Division', emptyLabel: 'No division', options: divisions.map((d) => ({ value: d.id, label: d.name })) },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only published FAQs appear on the public site.' },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only. Record what still needs confirming before publishing.' },
  ]
}
