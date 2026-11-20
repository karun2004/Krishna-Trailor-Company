'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { moveItem, type ActionResult } from '@/lib/admin/fields'

export type MediaItem = { id: string; media_id: string | null; url: string | null; alt: string | null; caption: string | null; phase?: string }

export type MediaItemsActions = {
  add: (mediaId: string, phase?: string) => Promise<ActionResult>
  update: (id: string, values: { caption: string | null; phase?: string }) => Promise<ActionResult>
  remove: (id: string) => Promise<ActionResult>
  reorder: (orderedIds: string[]) => Promise<ActionResult>
}

const PHASES = ['before', 'during', 'after'] as const
const btn =
  'rounded border border-navy/20 px-2.5 py-1 text-sm font-medium text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange disabled:opacity-50'

/** Ordered image list with add (MediaPicker), optional before/during/after tag, caption, reorder, remove. */
export function MediaItemsManager({ items: initial, actions, withPhase, heading }: {
  items: MediaItem[]
  actions: MediaItemsActions
  withPhase: boolean
  heading: string
}) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [newPhase, setNewPhase] = useState<string>('before')
  const [pickerKey, setPickerKey] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function run(fn: () => Promise<ActionResult>, ok: string, after?: () => void) {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) return setError(res.error)
      after?.()
      setMessage(ok)
      router.refresh()
    })
  }

  const label = (it: MediaItem, i: number) => it.alt || it.caption || `image ${i + 1}`

  return (
    <section aria-labelledby="media-items-h" className="mt-10 border-t border-navy/10 pt-6">
      <h2 id="media-items-h" className="font-display text-lg font-semibold text-navy">{heading}</h2>
      <div className="my-4 flex flex-wrap items-end gap-4">
        {withPhase && (
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy">Tag for new images</span>
            <select value={newPhase} onChange={(e) => setNewPhase(e.target.value)} className="rounded border border-navy/30 px-3 py-2">
              {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        )}
        <MediaPicker
          key={pickerKey}
          label="adding to the list"
          value={null}
          onChange={(mediaId) => {
            if (!mediaId) return
            run(() => actions.add(mediaId, withPhase ? newPhase : undefined), 'Image added', () => setPickerKey((k) => k + 1))
          }}
        />
      </div>
      <div role="status" aria-live="polite" className="min-h-5 text-sm text-black/70">{message}</div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {items.length === 0 && <p className="text-sm text-black/70">No images yet.</p>}
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={it.id} data-testid="media-item" className="flex flex-wrap items-start gap-3 rounded border border-navy/10 p-3">
            {it.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.url} alt={it.alt ?? ''} className="h-20 w-28 rounded object-cover" />
            ) : (
              <div className="flex h-20 w-28 items-center justify-center rounded border border-dashed text-xs">Missing</div>
            )}
            <div className="flex min-w-48 flex-1 flex-wrap gap-3">
              {withPhase && (
                <label className="text-sm">
                  <span className="mb-1 block">Tag<span className="sr-only"> for {label(it, i)}</span></span>
                  <select
                    value={it.phase}
                    onChange={(e) => {
                      const phase = e.target.value
                      setItems((l) => l.map((x) => (x.id === it.id ? { ...x, phase } : x)))
                      run(() => actions.update(it.id, { caption: it.caption, phase }), 'Tag saved')
                    }}
                    className="rounded border border-navy/30 px-2 py-1.5"
                  >
                    {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
              )}
              <label className="flex-1 text-sm">
                <span className="mb-1 block">Caption<span className="sr-only"> for {label(it, i)}</span></span>
                <input
                  type="text"
                  value={it.caption ?? ''}
                  maxLength={300}
                  onChange={(e) => setItems((l) => l.map((x) => (x.id === it.id ? { ...x, caption: e.target.value } : x)))}
                  onBlur={() => run(() => actions.update(it.id, { caption: it.caption || null, phase: it.phase }), 'Caption saved')}
                  className="w-full rounded border border-navy/30 px-2 py-1.5"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="button" className={btn} disabled={pending || i === 0} aria-label={`Move ${label(it, i)} up`}
                onClick={() => { const next = moveItem(items, i, -1); setItems(next); run(() => actions.reorder(next.map((x) => x.id)), 'Order saved') }}>↑</button>
              <button type="button" className={btn} disabled={pending || i === items.length - 1} aria-label={`Move ${label(it, i)} down`}
                onClick={() => { const next = moveItem(items, i, 1); setItems(next); run(() => actions.reorder(next.map((x) => x.id)), 'Order saved') }}>↓</button>
              <button type="button" className={btn} disabled={pending} aria-label={`Remove ${label(it, i)}`}
                onClick={() => run(() => actions.remove(it.id), 'Image removed', () => setItems((l) => l.filter((x) => x.id !== it.id)))}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
