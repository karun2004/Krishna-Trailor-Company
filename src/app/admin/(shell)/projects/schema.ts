import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, slugSchema, uuidOrNull } from '@/lib/admin/schema'

const dateOrNull = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .nullish()
  .or(z.literal(''))
  .transform((v) => v || null)

export const projectSchema = z.object({
  title: requiredText('Title'),
  slug: slugSchema,
  location: optionalText(200),
  description: optionalText(5000),
  service_category: optionalText(100),
  project_date: dateOrNull,
  featured_media_id: uuidOrNull,
  division_id: uuidOrNull,
  featured: z.boolean(),
  published: z.boolean(),
  verification_note: optionalText(1000),
})

export function projectFields(divisions: { id: string; name: string }[]): Field[] {
  return [
    { type: 'text', name: 'title', label: 'Title' },
    { type: 'slug', name: 'slug', label: 'Slug', from: 'title', help: 'Used in the public URL.' },
    { type: 'text', name: 'location', label: 'Location' },
    { type: 'textarea', name: 'description', label: 'Description', rows: 6 },
    { type: 'text', name: 'service_category', label: 'Service category' },
    { type: 'text', name: 'project_date', label: 'Project date', placeholder: 'YYYY-MM-DD' },
    { type: 'media', name: 'featured_media_id', label: 'Featured image' },
    { type: 'select', name: 'division_id', label: 'Division', emptyLabel: 'No division', options: divisions.map((d) => ({ value: d.id, label: d.name })) },
    { type: 'boolean', name: 'featured', label: 'Featured' },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only published projects appear on the public site.' },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only. Record what still needs confirming before publishing.' },
  ]
}
