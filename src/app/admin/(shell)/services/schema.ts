import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, slugSchema, uuidOrNull } from '@/lib/admin/schema'

export const serviceSchema = z.object({
  name: requiredText('Name'),
  slug: slugSchema,
  category: optionalText(100),
  summary: optionalText(500),
  description: optionalText(5000),
  main_media_id: uuidOrNull,
  division_id: uuidOrNull,
  featured: z.boolean(),
  published: z.boolean(),
  seo_title: optionalText(120),
  seo_description: optionalText(300),
  verification_note: optionalText(1000),
})
export type ServiceInput = z.infer<typeof serviceSchema>

export function serviceFields(divisions: { id: string; name: string }[]): Field[] {
  return [
    { type: 'text', name: 'name', label: 'Name' },
    { type: 'slug', name: 'slug', label: 'Slug', from: 'name', help: 'Used in the public URL.' },
    { type: 'text', name: 'category', label: 'Category' },
    { type: 'textarea', name: 'summary', label: 'Summary', rows: 3 },
    { type: 'textarea', name: 'description', label: 'Description', rows: 6 },
    { type: 'media', name: 'main_media_id', label: 'Main image' },
    { type: 'select', name: 'division_id', label: 'Division', emptyLabel: 'No division', options: divisions.map((d) => ({ value: d.id, label: d.name })) },
    { type: 'boolean', name: 'featured', label: 'Featured' },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only published services appear on the public site.' },
    { type: 'text', name: 'seo_title', label: 'SEO title' },
    { type: 'textarea', name: 'seo_description', label: 'SEO description', rows: 2 },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only. Record what still needs confirming before publishing.' },
  ]
}
