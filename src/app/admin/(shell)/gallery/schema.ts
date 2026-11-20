import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, slugSchema, uuidOrNull } from '@/lib/admin/schema'

export const albumSchema = z.object({
  title: requiredText('Title'),
  slug: slugSchema,
  description: optionalText(2000),
  cover_media_id: uuidOrNull,
  division_id: uuidOrNull,
  published: z.boolean(),
  verification_note: optionalText(1000),
})

export function albumFields(divisions: { id: string; name: string }[]): Field[] {
  return [
    { type: 'text', name: 'title', label: 'Title' },
    { type: 'slug', name: 'slug', label: 'Slug', from: 'title', help: 'Used in the public URL.' },
    { type: 'textarea', name: 'description', label: 'Description', rows: 4 },
    { type: 'media', name: 'cover_media_id', label: 'Cover image' },
    { type: 'select', name: 'division_id', label: 'Division', emptyLabel: 'No division', options: divisions.map((d) => ({ value: d.id, label: d.name })) },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only published albums appear on the public site.' },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only.' },
  ]
}
