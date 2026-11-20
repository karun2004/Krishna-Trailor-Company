import 'server-only'
import { createServerClient } from '@/lib/supabase/server'
import type { MediaItem } from './MediaItemsManager'

type Row = {
  id: string
  media_id: string | null
  phase?: string
  caption: string | null
  media: { storage_path: string; bucket: string; alt: string | null } | { storage_path: string; bucket: string; alt: string | null }[] | null
}

/** Loads ordered child rows (project_images / gallery_album_media) with resolved public URLs. */
export async function loadMediaItems(table: 'project_images' | 'gallery_album_media', parentCol: 'project_id' | 'album_id', parentId: string): Promise<MediaItem[]> {
  const db = await createServerClient()
  const cols = table === 'project_images' ? 'id, media_id, phase, caption' : 'id, media_id, caption'
  const { data, error } = await db
    .from(table)
    .select(`${cols}, media:media_assets(storage_path, bucket, alt)`)
    .eq(parentCol, parentId)
    .order('sort_order')
    .order('created_at')
  if (error) throw new Error('Failed to load images')
  return ((data ?? []) as unknown as Row[]).map((r) => {
    const m = Array.isArray(r.media) ? r.media[0] : r.media
    return {
      id: r.id,
      media_id: r.media_id,
      url: m ? db.storage.from(m.bucket).getPublicUrl(m.storage_path).data.publicUrl : null,
      alt: m?.alt ?? null,
      caption: r.caption,
      phase: r.phase,
    }
  })
}
