import type { MediaRef } from '@/lib/queries/types'

export const FALLBACK_WIDTH = 1600
export const FALLBACK_HEIGHT = 1000

export type ResolvedMedia = { src: string; alt: string; width: number; height: number }

const positive = (n: number | null | undefined, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.round(n) : fallback

/** Normalises a MediaRef for next/image. Returns null (render placeholder) for null/blank/invalid refs; never throws. */
export function resolveMediaImage(media: MediaRef | null | undefined): ResolvedMedia | null {
  const url = media?.url?.trim()
  if (!media || !url) return null
  return {
    src: url,
    alt: media.alt?.trim() ?? '',
    width: positive(media.width, FALLBACK_WIDTH),
    height: positive(media.height, FALLBACK_HEIGHT),
  }
}
