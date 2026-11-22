import type { Db, MediaRef } from './types'

type MediaRow = {
  id: string
  storage_path: string
  bucket: string
  alt: string | null
  width: number | null
  height: number | null
  mime_type?: string | null
}

const MEDIA_COLS = 'id, storage_path, bucket, alt, width, height, mime_type'

export function toMediaRef(db: Db, row: MediaRow): MediaRef {
  const { data } = db.storage.from(row.bucket).getPublicUrl(row.storage_path)
  return { url: data.publicUrl, alt: row.alt, width: row.width, height: row.height, mime: row.mime_type ?? null }
}

/** Batch-resolve media ids. Missing/deleted ids are simply absent from the map. Never throws on dangling refs. */
export async function resolveMediaMap(
  db: Db,
  ids: ReadonlyArray<string | null | undefined>,
): Promise<Map<string, MediaRef>> {
  const unique = [...new Set(ids.filter((i): i is string => !!i))]
  const out = new Map<string, MediaRef>()
  if (unique.length === 0) return out
  const { data, error } = await db.from('media_assets').select(MEDIA_COLS).in('id', unique)
  if (error) throw new Error(`media_assets read failed: ${error.message}`)
  for (const row of (data ?? []) as MediaRow[]) out.set(row.id, toMediaRef(db, row))
  return out
}

/** Resolve one media id to a MediaRef, or null when the id is null/missing/deleted. */
export async function resolveMedia(db: Db, id: string | null | undefined): Promise<MediaRef | null> {
  if (!id) return null
  return (await resolveMediaMap(db, [id])).get(id) ?? null
}

/** Attach `media` to each row from the given media-id column. */
export async function withMedia<T extends Record<string, unknown>>(
  db: Db,
  rows: T[],
  col: keyof T & string,
): Promise<(T & { media: MediaRef | null })[]> {
  const map = await resolveMediaMap(db, rows.map((r) => r[col] as string | null))
  return rows.map((r) => ({ ...r, media: map.get(r[col] as string) ?? null }))
}
