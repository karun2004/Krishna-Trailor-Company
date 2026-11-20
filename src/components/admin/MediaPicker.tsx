'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getMediaForPicker, listMediaForPicker, type PickerMedia } from '@/lib/admin/media-actions'
import { MEDIA_CATEGORIES } from '@/lib/validation/media'

export type MediaPickerProps = {
  /** Selected media_assets.id (or null). */
  value: string | null
  onChange: (mediaId: string | null) => void
  label: string
  /** Pre-selects the category filter. */
  category?: string
  error?: string
  id?: string
}

const btn =
  'rounded border border-navy/20 px-3 py-1.5 text-sm font-medium text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange'

/** Modal browser over media_assets (search + category). Returns the chosen media id via onChange. */
export function MediaPicker({ value, onChange, label, category: initialCategory = '', error, id }: MediaPickerProps) {
  const uid = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const [selected, setSelected] = useState<PickerMedia | null>(null)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [items, setItems] = useState<PickerMedia[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Resolve preview for the current value.
  useEffect(() => {
    let live = true
    if (!value) {
      setSelected(null)
      return
    }
    getMediaForPicker(value).then((m) => live && setSelected(m))
    return () => {
      live = false
    }
  }, [value])

  const load = useCallback(async (offset: number, query: string, cat: string) => {
    setLoading(true)
    setLoadError(null)
    const res = await listMediaForPicker({ q: query, category: cat || null, offset })
    setLoading(false)
    if (res.error) return setLoadError(res.error)
    setItems((prev) => (offset === 0 ? res.items : [...prev, ...res.items]))
    setHasMore(res.hasMore)
  }, [])

  function open() {
    dialogRef.current?.showModal()
    void load(0, q, category)
  }
  function close() {
    dialogRef.current?.close()
    openerRef.current?.focus()
  }
  function pick(m: PickerMedia) {
    onChange(m.id)
    setSelected(m)
    close()
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {selected ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.url} alt={selected.alt ?? ''} className="h-16 w-24 rounded border border-navy/10 object-cover" />
        ) : (
          <div aria-hidden="true" className="flex h-16 w-24 items-center justify-center rounded border border-dashed border-navy/30 text-xs text-black/60">
            {value ? '…' : 'None'}
          </div>
        )}
        <button ref={openerRef} id={id} type="button" onClick={open} className={btn} aria-describedby={error ? `${uid}-err` : undefined}>
          {value ? 'Change image' : 'Choose image'}
          <span className="sr-only"> for {label}</span>
        </button>
        {value && (
          <button type="button" onClick={() => { onChange(null); setSelected(null) }} className={btn}>
            Remove<span className="sr-only"> image for {label}</span>
          </button>
        )}
      </div>
      {error && <p id={`${uid}-err`} className="mt-1 text-sm text-red-700">{error}</p>}

      {mounted && createPortal(
      <dialog
        ref={dialogRef}
        aria-labelledby={`${uid}-title`}
        className="m-auto w-[min(60rem,95vw)] rounded-lg p-0 backdrop:bg-black/50"
        onClose={() => openerRef.current?.focus()}
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center justify-between border-b border-navy/10 p-4">
            <h2 id={`${uid}-title`} className="font-display text-lg font-semibold text-navy">Choose media</h2>
            <button type="button" onClick={close} className={btn}>Close</button>
          </div>
          <form
            role="search"
            className="flex flex-wrap gap-3 border-b border-navy/10 p-4"
            onSubmit={(e) => { e.preventDefault(); void load(0, q, category) }}
          >
            <label className="flex-1 text-sm">
              <span className="sr-only">Search media</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by description or file"
                className="w-full min-w-48 rounded border border-navy/30 px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="sr-only">Category</span>
              <select value={category} onChange={(e) => { setCategory(e.target.value); void load(0, q, e.target.value) }}
                className="rounded border border-navy/30 px-3 py-2">
                <option value="">All categories</option>
                {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            <button type="submit" className={btn}>Search</button>
          </form>
          <div className="overflow-y-auto p-4">
            {loadError && <p role="alert" className="text-sm text-red-700">{loadError}</p>}
            {!loading && !loadError && items.length === 0 && <p className="text-sm text-black/70">No media found.</p>}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => pick(m)} aria-pressed={m.id === value}
                    aria-label={`Select ${m.alt || m.category + ' image'}`}
                    className={`block w-full overflow-hidden rounded border-2 focus-visible:outline-2 focus-visible:outline-orange ${m.id === value ? 'border-orange' : 'border-transparent hover:border-navy/30'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <span className="block truncate px-1 py-1 text-left text-xs text-black/70">{m.alt || m.category}</span>
                  </button>
                </li>
              ))}
            </ul>
            {loading && <p role="status" className="mt-3 text-sm text-black/70">Loading…</p>}
            {hasMore && !loading && (
              <button type="button" className={`${btn} mt-4`} onClick={() => void load(items.length, q, category)}>Load more</button>
            )}
          </div>
        </div>
      </dialog>,
        document.body,
      )}
    </div>
  )
}
