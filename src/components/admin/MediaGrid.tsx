'use client'

import { isVideoUrl } from '@/lib/validation/media'
import { assetName, humanCategory, type LibraryAsset } from '@/lib/media-library'

const btn =
  'rounded-md border border-navy/20 bg-white px-2 py-1 text-xs text-navy hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'

/** Thumbnail grid. Each tile: a select button plus earlier/later reorder buttons (keyboard friendly). */
export function MediaGrid({
  assets, selectedId, onSelect, onMove, canReorder,
}: {
  assets: LibraryAsset[]
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
  canReorder: boolean
}) {
  return (
    <ul aria-label="Media assets" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {assets.map((a, i) => {
        const name = assetName(a)
        const selected = a.id === selectedId
        return (
          <li key={a.id} className={`overflow-hidden rounded-lg border bg-white ${selected ? 'border-orange ring-2 ring-orange' : 'border-navy/10'}`}>
            <button
              type="button"
              onClick={() => onSelect(a.id)}
              aria-pressed={selected}
              className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange"
            >
              {isVideoUrl(a.url) ? (
                <video src={`${a.url}#t=0.1`} muted preload="metadata" aria-label={a.alt ?? 'Video'} className="aspect-[4/3] w-full bg-black object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails from Supabase storage
                <img src={a.url} alt={a.alt ?? ''} loading="lazy" className="aspect-[4/3] w-full bg-soft object-cover" />
              )}
              <span className="block p-2">
                <span className="block truncate text-sm font-medium text-navy">{name}</span>
                <span className="block text-xs text-black/70">{humanCategory(a.category)}</span>
              </span>
            </button>
            <div className="flex gap-2 border-t border-navy/10 p-2">
              <button type="button" className={btn} disabled={!canReorder || i === 0} aria-label="Move earlier" aria-describedby={`n-${a.id}`} onClick={() => onMove(a.id, -1)}>
                &larr; Earlier
              </button>
              <button type="button" className={btn} disabled={!canReorder || i === assets.length - 1} aria-label="Move later" aria-describedby={`n-${a.id}`} onClick={() => onMove(a.id, 1)}>
                Later &rarr;
              </button>
              <span id={`n-${a.id}`} className="sr-only">{name}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
