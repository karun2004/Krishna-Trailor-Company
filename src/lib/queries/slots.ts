import 'server-only'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { MediaRef } from './types'
import { getPageContent } from './content'
import { slotFor } from '@/lib/media-slots'

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

/** MediaRef for /public/images/<file>, or null when the file has not been added yet (keeps the placeholder). */
export function staticMedia(file: string | undefined, alt = ''): MediaRef | null {
  if (!file || file.includes('/') || file.includes('..')) return null
  return existsSync(path.join(IMAGES_DIR, file)) ? { url: `/images/${file}`, alt, width: null, height: null } : null
}

/** Admin-chosen media wins; otherwise the static file; otherwise null. */
export function withFallback(media: MediaRef | null | undefined, file: string | undefined, alt = ''): MediaRef | null {
  return media ?? staticMedia(file, alt)
}

/** Returns a resolver for one page's named slots: admin media first, then /public/images fallback. */
export async function getSlots(page: string): Promise<(block: string) => MediaRef | null> {
  const blocks = await getPageContent(page).catch(() => ({} as Awaited<ReturnType<typeof getPageContent>>))
  return (block) => {
    const slot = slotFor(page, block)
    const m = blocks[block]?.media ?? null
    return m ? { ...m, alt: m.alt ?? slot?.alt ?? '' } : staticMedia(slot?.file, slot?.alt ?? '')
  }
}
