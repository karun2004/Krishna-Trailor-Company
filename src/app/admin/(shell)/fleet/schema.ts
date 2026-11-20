import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, slugSchema, uuidOrNull } from '@/lib/admin/schema'

export const FLEET_CATEGORIES = [
  'tractor_pullers',
  'low_bed_trailers',
  'semi_bed_trailers',
  'hydraulic_axle_systems',
  'cranes',
  'forklifts',
  'excavators',
  'other',
  'sleeper_buses',
  'seater_buses',
] as const
const categoryLabel = (c: string) => c.replace(/_/g, ' ').replace(/^./, (m) => m.toUpperCase())

export const fleetItemSchema = z.object({
  name: requiredText('Name'),
  slug: slugSchema,
  category: z.enum(FLEET_CATEGORIES, { error: 'Choose a category' }),
  description: optionalText(5000),
  capacity: optionalText(200),
  availability_status: optionalText(200),
  main_media_id: uuidOrNull,
  division_id: uuidOrNull,
  featured: z.boolean(),
  published: z.boolean(),
  verification_note: optionalText(1000),
})
export type FleetItemInput = z.infer<typeof fleetItemSchema>

export function fleetItemFields(divisions: { id: string; name: string }[]): Field[] {
  return [
    { type: 'text', name: 'name', label: 'Name' },
    { type: 'slug', name: 'slug', label: 'Slug', from: 'name', help: 'Used in the public URL.' },
    { type: 'select', name: 'category', label: 'Category', emptyLabel: 'Choose a category', options: FLEET_CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c) })) },
    { type: 'textarea', name: 'description', label: 'Description', rows: 6 },
    { type: 'text', name: 'capacity', label: 'Capacity' },
    { type: 'text', name: 'availability_status', label: 'Availability' },
    { type: 'media', name: 'main_media_id', label: 'Main image' },
    { type: 'select', name: 'division_id', label: 'Division', emptyLabel: 'No division', options: divisions.map((d) => ({ value: d.id, label: d.name })) },
    { type: 'boolean', name: 'featured', label: 'Featured' },
    { type: 'boolean', name: 'published', label: 'Published', help: 'Only published fleet items appear on the public site.' },
    { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only. Record what still needs confirming before publishing.' },
  ]
}
