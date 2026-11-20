'use server'
import { createEntityActions } from '@/lib/admin/entity-actions'
import type { ActionResult } from '@/lib/admin/fields'
import { albumSchema } from './schema'

const a = createEntityActions({
  table: 'gallery_albums',
  schema: albumSchema,
  revalidate: ['/admin/gallery', '/gallery'],
})

// 'use server' files may only export async functions, so wrap the factory's actions.
export async function saveAlbum(id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return a.save(id, values)
}
export async function setAlbumPublished(id: string, published: boolean): Promise<ActionResult> {
  return a.setPublished(id, published)
}
export async function deleteAlbum(id: string): Promise<ActionResult> {
  return a.remove(id)
}
export async function reorderAlbums(orderedIds: string[]): Promise<ActionResult> {
  return a.reorder(orderedIds)
}
