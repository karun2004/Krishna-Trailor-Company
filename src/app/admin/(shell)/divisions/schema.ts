import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, slugSchema, uuidOrNull } from '@/lib/admin/schema'

export const divisionSchema = z.object({
  name: requiredText('Name'),
  slug: slugSchema,
  tagline: optionalText(200),
  summary: optionalText(500),
  description: optionalText(5000),
  hero_media_id: uuidOrNull,
  cta_label: optionalText(100),
  cta_href: optionalText(500),
  published: z.boolean(),
  verification_note: optionalText(1000),
})
export type DivisionInput = z.infer<typeof divisionSchema>

export function divisionFields(): Field[] {
  return [
    { type: 'text', name: 'name', label: 'Name' },
    { type: 'slug', name: 'slug', label: 'Slug', from: 'name', help: 'Used in the public URL.' },
    { type: 'text', name: 'tagline', label: 'Tagline' },
    { type: 'textarea', name: 'summary', label: 'Summary', rows: 3 },
    { type: 'textarea', name: 'description', label: 'Description', rows: 6 },
    { type: 'media', name: 'hero_media_id', label: 'Hero image' },
    { type: 'text', name: 'cta_label', label: 'Button label' },
    { type: 'text', name: 'cta_href', label: 'Button link' },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only published divisions appear on the public site.' },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only. Record what still needs confirming before publishing.' },
  ]
}
