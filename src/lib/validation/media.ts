import { z } from 'zod'

export const MEDIA_CATEGORIES = [
  'homepage', 'krishna_trailor', 'heavy_haulage', 'radhe_travels', 'fleet', 'cranes',
  'excavators', 'jcb', 'industrial_jacks', 'odc_cargo', 'projects', 'gallery', 'team',
  'clients', 'other',
] as const

export const ALLOWED_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
} as const
export type AllowedMime = keyof typeof ALLOWED_MIME

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const category = z.enum(MEDIA_CATEGORIES)
const text = z.string().trim().max(500)

export const uploadSchema = z.object({
  category,
  alt: text.optional(),
  caption: text.optional(),
})

export const patchSchema = z
  .object({ category: category.optional(), alt: text.nullable().optional(), caption: text.nullable().optional() })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' })

export type FileCheck = { ok: true } | { ok: false; reason: string }

export function validateFile(mime: string, size: number): FileCheck {
  if (!(mime in ALLOWED_MIME)) {
    return { ok: false, reason: `File type "${mime || 'unknown'}" is not allowed. Use JPEG, PNG, WebP or AVIF.` }
  }
  if (size <= 0) return { ok: false, reason: 'The file is empty.' }
  if (size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: `File is too large (${(size / 1048576).toFixed(1)}MB). The limit is 10MB.` }
  }
  return { ok: true }
}

/** Maps sharp's decoded format name to the MIME it implies. */
export const FORMAT_TO_MIME: Record<string, AllowedMime> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heif: 'image/avif', // sharp reports avif as heif
  avif: 'image/avif',
}
