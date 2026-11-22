'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  assetName, formatBytes, humanCategory, placesLabel, type LibraryAsset, type UsageRow,
} from '@/lib/media-library'
import { mediaPublicUrl } from '@/lib/media-library'
import { isVideoUrl } from '@/lib/validation/media'

const field =
  'mt-1 w-full rounded-md border border-navy/20 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'
const btn =
  'rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange disabled:opacity-50'

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Request failed (${res.status}).`)
  return body as T
}

/** Detail panel: edit alt/caption, replace image, usage lookup, delete with confirm. Remount per asset via `key`. */
export function MediaDetail({
  asset, supabaseUrl, onChange, onDeleted, onClose,
}: {
  asset: LibraryAsset
  supabaseUrl: string
  onChange: (next: LibraryAsset) => void
  onDeleted: (id: string) => void
  onClose: () => void
}) {
  const [alt, setAlt] = useState(asset.alt ?? '')
  const [caption, setCaption] = useState(asset.caption ?? '')
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [usage, setUsage] = useState<UsageRow[] | null>(null)
  const [usageError, setUsageError] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const deleteBtnRef = useRef<HTMLButtonElement>(null)
  const altId = useId()
  const capId = useId()
  const repId = useId()

  const toAsset = (row: Omit<LibraryAsset, 'url'>): LibraryAsset => ({
    ...row, url: mediaPublicUrl(supabaseUrl, row.bucket, row.storage_path),
  })

  useEffect(() => {
    let live = true
    api<{ usage: UsageRow[] }>(`/api/admin/media/${asset.id}/usage`)
      .then((r) => live && setUsage(r.usage))
      .catch(() => live && setUsageError(true))
    return () => { live = false }
  }, [asset.id])

  useEffect(() => {
    if (!confirming) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setConfirming(false); deleteBtnRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirming])

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setMsg(null)
    try { await fn() } catch (e) { setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Something went wrong.' }) }
    setBusy(false)
  }

  const save = () => run(async () => {
    const row = await api<Omit<LibraryAsset, 'url'>>(`/api/admin/media/${asset.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ alt: alt.trim() || null, caption: caption.trim() || null }),
    })
    onChange(toAsset(row))
    setMsg({ kind: 'ok', text: 'Saved' })
  })

  const replace = (file: File) => run(async () => {
    const fd = new FormData()
    fd.set('file', file)
    const row = await api<Omit<LibraryAsset, 'url'>>(`/api/admin/media/${asset.id}`, { method: 'PUT', body: fd })
    onChange(toAsset(row))
    setMsg({ kind: 'ok', text: 'Image replaced' })
  })

  const remove = () => run(async () => {
    await api(`/api/admin/media/${asset.id}`, { method: 'DELETE' })
    setConfirming(false)
    onDeleted(asset.id)
  })

  const inUse = (usage?.length ?? 0) > 0

  return (
    <>
      <section aria-label="Asset details" className="rounded-lg border border-navy/10 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 truncate font-display text-lg font-semibold text-navy">{assetName(asset)}</h2>
          <button type="button" onClick={onClose} className={`${btn} border border-navy/20 text-navy`}>Close</button>
        </div>
        {isVideoUrl(asset.url) ? (
          <video src={asset.url} controls preload="metadata" className="mt-3 max-h-64 w-full rounded-md bg-black object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview from Supabase storage
          <img src={asset.url} alt={asset.alt ?? ''} className="mt-3 max-h-64 w-full rounded-md bg-soft object-contain" />
        )}
        <p className="mt-2 text-xs text-black/70">
          {humanCategory(asset.category)} · {asset.width ?? '?'}×{asset.height ?? '?'} · {asset.mime_type} · {formatBytes(asset.size_bytes)}
        </p>

        <form onSubmit={(e) => { e.preventDefault(); void save() }} className="mt-4 space-y-3">
          <div>
            <label htmlFor={altId} className="text-sm font-medium text-navy">Alt text</label>
            <input id={altId} value={alt} maxLength={500} onChange={(e) => setAlt(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={capId} className="text-sm font-medium text-navy">Caption</label>
            <textarea id={capId} value={caption} maxLength={500} rows={2} onChange={(e) => setCaption(e.target.value)} className={field} />
          </div>
          <button type="submit" disabled={busy} className={`${btn} bg-navy text-white hover:bg-navy/90`}>Save details</button>
        </form>

        <div className="mt-4">
          <label htmlFor={repId} className="text-sm font-medium text-navy">Replace file</label>
          <input
            id={repId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
            disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void replace(f); e.target.value = '' }}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-navy/20 file:bg-white file:px-3 file:py-2 file:text-navy focus-visible:outline-2 focus-visible:outline-orange"
          />
          <p className="mt-1 text-xs text-black/70">Keeps the same asset, so every place it is used updates.</p>
        </div>

        <div role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
          {msg && <span className={msg.kind === 'ok' ? 'text-green-800' : 'text-red-700'}>{msg.text}</span>}
        </div>

        <div className="mt-2 border-t border-navy/10 pt-3">
          <h3 className="text-sm font-semibold text-navy">Where used</h3>
          {usageError ? (
            <p className="mt-1 text-sm text-red-700">Could not load usage.</p>
          ) : usage === null ? (
            <p className="mt-1 text-sm text-black/70">Checking…</p>
          ) : usage.length === 0 ? (
            <p className="mt-1 text-sm text-black/70">Not used anywhere</p>
          ) : (
            <ul aria-label="Where used" className="mt-1 space-y-1 text-sm">
              {usage.map((u, i) => (
                <li key={`${u.entity_id}-${u.field}-${i}`}>
                  <span className="font-medium">{u.label}</span>
                  <span className="text-black/70"> · {u.entity} · {u.field}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          ref={deleteBtnRef}
          type="button"
          disabled={busy}
          onClick={() => setConfirming(true)}
          className={`${btn} mt-4 border border-red-700 text-red-700 hover:bg-red-50`}
        >
          Delete
        </button>
      </section>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" aria-describedby="del-desc" className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 id="del-title" className="font-display text-lg font-semibold text-navy">Delete this image?</h2>
            <p id="del-desc" className="mt-2 text-sm">
              {inUse
                ? `This image is used in ${placesLabel(usage!.length)}. Those places will fall back to no image. `
                : ''}
              This permanently deletes the file and cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button ref={cancelRef} type="button" onClick={() => { setConfirming(false); deleteBtnRef.current?.focus() }} className={`${btn} border border-navy/20 text-navy`}>Cancel</button>
              <button type="button" disabled={busy} onClick={() => void remove()} className={`${btn} bg-red-700 text-white hover:bg-red-800`}>
                {inUse ? 'Delete anyway' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
