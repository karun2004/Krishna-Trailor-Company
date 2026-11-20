import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, requiredText, uuidOrNull } from '@/lib/admin/schema'
import { optionalHttpUrl } from '../settings/validators'

export const seoSchema = z.object({
  page_key: requiredText('Page key', 100),
  slug: optionalText(200),
  title: optionalText(120),
  meta_description: optionalText(300),
  og_media_id: uuidOrNull,
  canonical_url: optionalHttpUrl,
  published: z.boolean(),
  verification_note: optionalText(1000),
})
export type SeoInput = z.infer<typeof seoSchema>

export const seoFields: Field[] = [
  { type: 'text', name: 'page_key', label: 'Page key', help: 'Identifies the page, e.g. home, contact.' },
  { type: 'text', name: 'slug', label: 'Path', placeholder: '/contact' },
  { type: 'text', name: 'title', label: 'Title', help: 'Shown in search results and browser tabs (up to 120 characters).' },
  { type: 'textarea', name: 'meta_description', label: 'Meta description', rows: 3, help: 'Up to 300 characters; around 155 is ideal.' },
  { type: 'media', name: 'og_media_id', label: 'Social share image' },
  { type: 'text', name: 'canonical_url', label: 'Canonical URL' },
  { type: 'boolean', name: 'published', label: 'Published', help: 'Only published entries are used on the public site.' },
  { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only.' },
]
