import { z } from 'zod'
import type { Field } from '@/lib/admin/fields'
import { optionalText, uuidOrNull } from '@/lib/admin/schema'

/** Block content is edited as a JSON object (headline copy, labels, links...). */
export const contentSchema = z
  .string()
  .trim()
  .max(20_000, 'Content is too long')
  .transform((v, ctx) => {
    try {
      const parsed: unknown = JSON.parse(v)
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not object')
      return parsed as Record<string, unknown>
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Enter valid JSON: an object like {"headline": "..."}' })
      return z.NEVER
    }
  })

export const blockSchema = z.object({
  content: contentSchema,
  media_id: uuidOrNull,
  published: z.boolean(),
  verification_note: optionalText(1000),
})
export type BlockInput = z.infer<typeof blockSchema>

export const blockFields: Field[] = [
  { type: 'textarea', name: 'content', label: 'Content', rows: 8, help: 'JSON object. Edit the text values; keep the keys.' },
  { type: 'media', name: 'media_id', label: 'Image' },
  { type: 'boolean', name: 'published', label: 'Published', help: 'Unpublished blocks are hidden on the public site.' },
  { type: 'textarea', name: 'verification_note', label: 'Verification note', rows: 2, help: 'Admin-only.' },
]
