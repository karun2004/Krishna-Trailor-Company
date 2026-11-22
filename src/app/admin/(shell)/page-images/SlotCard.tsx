'use client'

import { useState, useTransition } from 'react'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { saveSlot } from '@/lib/admin/slot-actions'

export type SlotCardProps = {
  slotId: string
  /** Overrides saving (fleet/service/division cards). */
  save?: (mediaId: string | null) => Promise<{ ok: true } | { ok: false; error: string }>
  note?: string
  label: string
  aspect: string
  file: string
  fallbackExists: boolean
  initialMediaId: string | null
}

export function SlotCard({ slotId, save: customSave, note, label, aspect, file, fallbackExists, initialMediaId }: SlotCardProps) {
  const [mediaId, setMediaId] = useState<string | null>(initialMediaId)
  const [saved, setSaved] = useState<string | null>(initialMediaId)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const dirty = mediaId !== saved

  function save() {
    setMsg(null)
    start(async () => {
      const res = await (customSave ? customSave(mediaId) : saveSlot(slotId, mediaId))
      if (res.ok) { setSaved(mediaId); setMsg({ ok: true, text: 'Saved. The site is updated.' }) }
      else setMsg({ ok: false, text: res.error })
    })
  }

  const source = note ?? (saved ? 'Showing the image chosen here' : fallbackExists ? `Showing /images/${file}` : 'Empty: the site shows a placeholder')
  return (
    <li className="rounded-lg border border-navy/10 bg-white p-4" data-slot={slotId}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-navy">{label}</h3>
        <p className="font-mono text-xs text-black/60">Ratio {aspect.replace('/', ':')}</p>
      </div>
      <p className="mt-1 text-xs text-black/70">{source}.{file ? <> Default file: <code>{file}</code></> : null}</p>
      <div className="mt-3">
        <MediaPicker value={mediaId} onChange={(v) => { setMediaId(v); setMsg(null) }} label={label} category="" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="rounded-full bg-black px-5 py-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-orange"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
        {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-green-800' : 'text-red-700'}`}>{msg.text}</p>}
      </div>
    </li>
  )
}
