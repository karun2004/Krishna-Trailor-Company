import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, uuidOrNull } from '@/lib/admin/schema'

const urlOrNull = z
  .string()
  .trim()
  .max(500, 'Must be 500 characters or fewer')
  .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'Enter a full URL starting with http:// or https://')
  .nullish()
  .transform((v) => v || null)

export const clientSchema = z.object({
  name: requiredText('Name'),
  media_id: uuidOrNull,
  website_url: urlOrNull,
  published: z.boolean(),
  verification_note: optionalText(1000),
})

export function clientFields(): Field[] {
  return [
    { type: 'text', name: 'name', label: 'Name' },
    { type: 'media', name: 'media_id', label: 'Logo' },
    { type: 'text', name: 'website_url', label: 'Website URL', placeholder: 'https://' },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only published logos appear on the public site.' },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only. Confirm permission to show this logo before publishing.' },
  ]
}
