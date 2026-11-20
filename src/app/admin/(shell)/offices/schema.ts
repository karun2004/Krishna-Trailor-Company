import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText } from '@/lib/admin/schema'
import { optionalHttpUrl } from '../settings/validators'

export const officeSchema = z.object({
  name: requiredText('Name'),
  address: optionalText(500),
  phone: optionalText(50),
  email: optionalText(320),
  map_url: optionalHttpUrl,
  is_head_office: z.boolean(),
  published: z.boolean(),
  verification_note: optionalText(1000),
})
export type OfficeInput = z.infer<typeof officeSchema>

export const officeFields: Field[] = [
  { type: 'text', name: 'name', label: 'Name' },
  { type: 'textarea', name: 'address', label: 'Address', rows: 3 },
  { type: 'text', name: 'phone', label: 'Phone' },
  { type: 'text', name: 'email', label: 'Email' },
  { type: 'text', name: 'map_url', label: 'Map URL', help: 'Full https:// link to the location on a map.' },
  { type: 'boolean', name: 'is_head_office', label: 'Head office' },
  { type: 'boolean', name: 'published', label: 'Published', help: 'Only published offices appear on the public site.' },
  { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only. Record what still needs confirming before publishing.' },
]
