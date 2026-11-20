/** Pure helpers for the admin media library (no I/O, safe for client and tests). */

export type LibraryAsset = {
  id: string
  storage_path: string
  bucket: string
  alt: string | null
  caption: string | null
  category: string
  mime_type: string
  width: number | null
  height: number | null
  size_bytes: number | null
  sort_order: number | null
  created_at: string
  url: string
}

export type UsageRow = { entity: string; entity_id: string; label: string; field: string }

export const mediaPublicUrl = (base: string, bucket: string, path: string) =>
  `${base.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${path}`

/** Display name: alt text when set, otherwise the file name in storage. */
export const assetName = (a: Pick<LibraryAsset, 'alt' | 'storage_path'>) =>
  a.alt?.trim() || a.storage_path.split('/').pop() || a.storage_path

/** Library order: explicit sort_order first, newest first as tiebreak. */
export function sortAssets<T extends Pick<LibraryAsset, 'sort_order' | 'created_at'>>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || b.created_at.localeCompare(a.created_at),
  )
}

export function filterAssets<T extends Pick<LibraryAsset, 'alt' | 'caption' | 'storage_path' | 'category'>>(
  list: T[],
  opts: { query: string; category: string },
): T[] {
  const q = opts.query.trim().toLowerCase()
  return list.filter((a) => {
    if (opts.category && a.category !== opts.category) return false
    if (!q) return true
    return [a.alt, a.caption, a.storage_path].some((f) => f?.toLowerCase().includes(q))
  })
}

/**
 * Moves `id` one step earlier/later among the currently visible ids and returns the new full
 * order. Hidden (filtered-out) items keep their slots; visible ones swap slots.
 */
export function moveInOrder(fullIds: string[], visibleIds: string[], id: string, dir: -1 | 1): string[] {
  const vi = visibleIds.indexOf(id)
  const target = visibleIds[vi + dir]
  if (vi < 0 || target === undefined) return fullIds
  const out = [...fullIds]
  const a = out.indexOf(id)
  const b = out.indexOf(target)
  if (a < 0 || b < 0) return fullIds
  ;[out[a], out[b]] = [out[b], out[a]]
  return out
}

export function formatBytes(n: number | null): string {
  if (n == null) return 'unknown size'
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}

export const humanCategory = (c: string) => c.replace(/_/g, ' ').replace(/^./, (m) => m.toUpperCase())

export const placesLabel = (n: number) => `${n} ${n === 1 ? 'place' : 'places'}`

/** Default alt text for a freshly uploaded file: its name without the extension. */
export const altFromFilename = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').slice(0, 500)
