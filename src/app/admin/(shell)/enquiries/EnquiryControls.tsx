'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { ENQUIRY_STATUSES, STATUS_LABEL, canTransition, type EnquiryStatus } from '@/lib/admin/enquiries'
import { deleteEnquiry, saveEnquiryNotes, setEnquiryStatus } from './actions'

const btn = 'rounded border border-navy/20 px-3 py-1.5 text-sm font-medium text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange disabled:opacity-50'

export function EnquiryControls({ id, status, notes }: { id: string; status: EnquiryStatus; notes: string }) {
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const [next, setNext] = useState<EnquiryStatus>(status)
  const [text, setText] = useState(notes)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const options = ENQUIRY_STATUSES.filter((s) => s === status || canTransition(status, s))

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) =>
    start(async () => {
      const r = await fn()
      setMsg(r.ok ? { ok: true, text: okText } : { ok: false, text: r.error ?? 'Failed.' })
      if (r.ok) after?.()
    })

  return (
    <div className="space-y-6">
      <section aria-labelledby="st" className="space-y-2 rounded-lg border border-navy/10 bg-white p-4">
        <h2 id="st" className="font-semibold">Status</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="status-sel" className="block text-sm">Change status</label>
            <select id="status-sel" value={next} onChange={(e) => setNext(e.target.value as EnquiryStatus)} className="rounded border border-navy/30 bg-white px-3 py-2 text-sm">
              {options.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          <button type="button" className={btn} disabled={pending || next === status}
            onClick={() => run(() => setEnquiryStatus(id, next), 'Status updated', () => router.refresh())}>Update status</button>
        </div>
      </section>

      <section className="space-y-2 rounded-lg border border-navy/10 bg-white p-4">
        <h2 className="font-semibold">Internal notes</h2>
        <label htmlFor="notes" className="sr-only">Internal notes</label>
        <textarea id="notes" value={text} maxLength={5000} rows={5} onChange={(e) => setText(e.target.value)} className="w-full rounded border border-navy/30 px-3 py-2 text-sm" />
        <button type="button" className={btn} disabled={pending} onClick={() => run(() => saveEnquiryNotes(id, text), 'Notes saved')}>Save notes</button>
      </section>

      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`rounded px-3 py-2 text-sm ${msg.ok ? 'bg-soft text-navy' : 'bg-blue text-navy'}`}>{msg.text}</p>}

      <button type="button" className={`${btn} text-red-700`} onClick={() => dialog.current?.showModal()}>Delete enquiry</button>
      <dialog ref={dialog} aria-labelledby="del-h" className="m-auto w-[min(26rem,92vw)] rounded-lg p-0 backdrop:bg-black/50">
        <div className="space-y-4 p-5">
          <h2 id="del-h" className="font-display text-lg font-semibold text-navy">Delete this enquiry?</h2>
          <p className="text-sm text-black/80">This permanently removes it and any attachment. It cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button type="button" className={btn} onClick={() => dialog.current?.close()}>Cancel</button>
            <button type="button" disabled={pending} onClick={() => run(() => deleteEnquiry(id), 'Deleted', () => router.push('/admin/enquiries'))}
              className="rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">Confirm delete</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
