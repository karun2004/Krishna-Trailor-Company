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

export const ALLOWED_VIDEO_MIME = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
} as const
export type AllowedVideoMime = keyof typeof ALLOWED_VIDEO_MIME
export const isVideoMime = (mime: string | null | undefined): boolean => !!mime && mime in ALLOWED_VIDEO_MIME

/** Storage paths keep the upload extension, so a URL is enough to tell a clip from a photo. */
export const isVideoUrl = (url: string | null | undefined): boolean => !!url && /\.(mp4|webm)(\?|#|$)/i.test(url)

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024

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
  if (isVideoMime(mime)) {
    if (size <= 0) return { ok: false, reason: 'The file is empty.' }
    if (size > MAX_VIDEO_BYTES) {
      return { ok: false, reason: `Video is too large (${(size / 1048576).toFixed(1)}MB). The limit is 50MB.` }
    }
    return { ok: true }
  }
  if (!(mime in ALLOWED_MIME)) {
    return { ok: false, reason: `File type "${mime || 'unknown'}" is not allowed. Use JPEG, PNG, WebP or AVIF (images) or MP4 or WebM (video).` }
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
