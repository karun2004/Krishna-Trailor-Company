'use client'

import { useId, useMemo, useState } from 'react'
import { MEDIA_CATEGORIES } from '@/lib/validation/media'
import {
  filterAssets, humanCategory, mediaPublicUrl, moveInOrder, sortAssets, type LibraryAsset,
} from '@/lib/media-library'
import { Dropzone } from './Dropzone'
import { MediaGrid } from './MediaGrid'
import { MediaDetail } from './MediaDetail'

const field =
  'rounded-md border border-navy/20 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'

export function MediaLibrary({ initial, supabaseUrl }: { initial: LibraryAsset[]; supabaseUrl: string }) {
  const [assets, setAssets] = useState(() => sortAssets(initial))
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const qId = useId()
  const cId = useId()

  const visible = useMemo(() => filterAssets(assets, { query, category }), [assets, query, category])
  const selected = assets.find((a) => a.id === selectedId) ?? null

  async function move(id: string, dir: -1 | 1) {
    const fullIds = assets.map((a) => a.id)
    const next = moveInOrder(fullIds, visible.map((a) => a.id), id, dir)
    if (next === fullIds) return
    const prev = assets
    const byId = new Map(assets.map((a) => [a.id, a]))
    setAssets(next.map((nid, i) => ({ ...byId.get(nid)!, sort_order: i })))
    setError(null)
    const res = await fetch('/api/admin/media/reorder', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: next }),
    }).catch(() => null)
    if (!res?.ok) { setAssets(prev); setError('Could not save the new order. Please try again.') }
  }

  const onUploaded = (raw: LibraryAsset) =>
    setAssets((l) => sortAssets([{ ...raw, url: mediaPublicUrl(supabaseUrl, raw.bucket, raw.storage_path) }, ...l]))

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        <Dropzone onUploaded={onUploaded} />

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor={qId} className="block text-sm font-medium text-navy">Search media</label>
            <input id={qId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, alt text or caption" className={`${field} mt-1 w-full`} />
          </div>
          <div>
            <label htmlFor={cId} className="block text-sm font-medium text-navy">Filter by category</label>
            <select id={cId} value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} mt-1`}>
              <option value="">All categories</option>
              {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{humanCategory(c)}</option>)}
            </select>
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <p aria-live="polite" className="text-sm text-black/70">{visible.length} of {assets.length} images</p>

        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-navy/20 p-8 text-center text-sm text-black/70">
            {assets.length === 0 ? 'No media yet. Upload your first image above.' : 'No media match your search or filter.'}
          </p>
        ) : (
          <MediaGrid assets={visible} selectedId={selectedId} onSelect={setSelectedId} onMove={move} canReorder />
        )}
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        {selected ? (
          <MediaDetail
            key={selected.id}
            asset={selected}
            supabaseUrl={supabaseUrl}
            onChange={(next) => setAssets((l) => l.map((a) => (a.id === next.id ? next : a)))}
            onDeleted={(id) => { setAssets((l) => l.filter((a) => a.id !== id)); setSelectedId(null) }}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <p className="rounded-lg border border-dashed border-navy/20 p-6 text-sm text-black/70">Select an image to edit its details.</p>
        )}
      </aside>
    </div>
  )
}
