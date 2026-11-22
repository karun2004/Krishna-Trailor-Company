'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { getMediaForPicker, type PickerMedia } from '@/lib/admin/media-actions'
import { deleteSection, saveSection } from '@/lib/admin/section-actions'
import { isVideoMime } from '@/lib/validation/media'

export type SectionRow = { id: string; page: string; published: boolean; placement: 'top' | 'bottom'; title: string; body: string; mediaIds: string[] }
type Page = { key: string; label: string }

const field = 'w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-orange'
const lbl = 'mb-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-black/70'

function Thumb({ id, onRemove }: { id: string; onRemove: () => void }) {
  const [m, setM] = useState<PickerMedia | null>(null)
  useEffect(() => { void getMediaForPicker(id).then(setM) }, [id])
  return (
    <li className="relative">
      {m && isVideoMime(m.mime) ? <video src={`${m.url}#t=0.1`} muted preload="metadata" className="h-16 w-24 rounded bg-black object-cover" />
        // eslint-disable-next-line @next/next/no-img-element
        : m ? <img src={m.url} alt={m.alt ?? ''} className="h-16 w-24 rounded object-cover" /> : <div className="h-16 w-24 rounded bg-soft" />}
      <button type="button" onClick={onRemove} aria-label="Remove this item" className="absolute -right-2 -top-2 size-6 rounded-full bg-black text-xs text-white focus-visible:outline-2 focus-visible:outline-orange">×</button>
    </li>
  )
}

function Form({ pages, initial, onDone }: { pages: Page[]; initial: SectionRow | null; onDone: () => void }) {
  const router = useRouter()
  const [v, setV] = useState<SectionRow>(initial ?? { id: '', page: pages[0].key, published: true, placement: 'bottom', title: '', body: '', mediaIds: [] })
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [pickerKey, setPickerKey] = useState(0)
  const submit = () => start(async () => {
    const r = await saveSection(initial?.id ?? null, { page: v.page, placement: v.placement, title: v.title, body: v.body, mediaIds: v.mediaIds, published: v.published })
    if (r.ok) { router.refresh(); onDone() } else setMsg(r.error)
  })
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={lbl} htmlFor="s-page">Page</label>
          <select id="s-page" className={field} value={v.page} onChange={(e) => setV({ ...v, page: e.target.value })}>{pages.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select></div>
        <div><label className={lbl} htmlFor="s-place">Position</label>
          <select id="s-place" className={field} value={v.placement} onChange={(e) => setV({ ...v, placement: e.target.value as 'top' | 'bottom' })}>
            <option value="top">Right after the page header</option><option value="bottom">Near the bottom, before the call to action</option></select></div>
      </div>
      <div className="mt-4"><label className={lbl} htmlFor="s-title">Title</label><input id="s-title" className={field} value={v.title} maxLength={120} onChange={(e) => setV({ ...v, title: e.target.value })} /></div>
      <div className="mt-4"><label className={lbl} htmlFor="s-body">Text</label><textarea id="s-body" rows={4} className={field} value={v.body} maxLength={3000} onChange={(e) => setV({ ...v, body: e.target.value })} /></div>
      <div className="mt-4">
        <span className={lbl}>Photos and videos ({v.mediaIds.length}/12)</span>
        {v.mediaIds.length > 0 && <ul className="mb-3 flex flex-wrap gap-3">{v.mediaIds.map((id) => <Thumb key={id} id={id} onRemove={() => setV({ ...v, mediaIds: v.mediaIds.filter((x) => x !== id) })} />)}</ul>}
        {v.mediaIds.length < 12 && (
          <MediaPicker key={pickerKey} value={null} label="this section" onChange={(id) => { if (id && !v.mediaIds.includes(id)) setV((s) => ({ ...s, mediaIds: [...s.mediaIds, id] })); setPickerKey((k) => k + 1) }} />
        )}
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} /> Published (visible on the site)</label>
      {msg && <p role="alert" className="mt-3 text-sm text-red-700">{msg}</p>}
      <div className="mt-5 flex gap-3">
        <button type="button" disabled={pending} onClick={submit} className="rounded-full bg-orange px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-black disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange">{pending ? 'Saving…' : 'Save section'}</button>
        <button type="button" onClick={onDone} className="rounded-full border border-black/30 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.14em]">Cancel</button>
      </div>
    </div>
  )
}

export function SectionEditor({ pages, rows }: { pages: Page[]; rows: SectionRow[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<SectionRow | 'new' | null>(null)
  const [, start] = useTransition()
  const label = (k: string) => pages.find((p) => p.key === k)?.label ?? k
  return (
    <div className="space-y-6">
      {editing ? <Form key={editing === 'new' ? 'new' : editing.id} pages={pages} initial={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />
        : <button type="button" onClick={() => setEditing('new')} className="rounded-full bg-black px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange">+ New section</button>}
      {rows.length === 0 ? <p className="text-sm text-black/60">No sections yet.</p> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-black/60">{label(r.page)} · {r.placement === 'top' ? 'after header' : 'near bottom'} · {r.mediaIds.length} media{r.published ? '' : ' · hidden'}</p>
                <p className="truncate font-display text-lg font-bold uppercase">{r.title || r.body.slice(0, 50) || 'Untitled'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(r)} className="rounded-full border border-black/30 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em]">Edit</button>
                <button type="button" onClick={() => { if (confirm('Delete this section?')) start(async () => { await deleteSection(r.id, r.page); router.refresh() }) }} className="rounded-full border border-red-700/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-red-700">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
