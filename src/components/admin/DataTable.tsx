'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState, useTransition } from 'react'
import { matchesQuery, type ActionResult } from '@/lib/admin/fields'

export type Column<T> = {
  key: keyof T & string
  header: string
  /** Serializable formatting (usable from Server Components). Default 'text'. */
  kind?: 'text' | 'boolean' | 'date'
  /** Custom cell (only from a Client Component). */
  render?: (row: T) => React.ReactNode
}

export type DataTableProps<T extends { id: string }> = {
  rows: T[]
  columns: Column<T>[]
  /** Row field used as the accessible name in button/link labels (e.g. "name"). */
  labelKey: keyof T & string
  /** e.g. '/admin/services' — edit links go to `${basePath}/${id}`. */
  basePath: string
  /** Plural noun used for the search label and empty state, e.g. "services". */
  entityLabel: string
  /** Columns searched client-side (default: every 'text' column). */
  searchKeys?: (keyof T & string)[]
  /** Provide to show the publish switch (rows need a boolean `published`). */
  onSetPublished?: (id: string, published: boolean) => Promise<ActionResult>
  /** Provide to show Delete (with confirmation dialog). */
  onDelete?: (id: string) => Promise<ActionResult>
}

const btn =
  'rounded border border-navy/20 px-2.5 py-1 text-sm font-medium text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange disabled:opacity-50'

const fmtDate = (iso: unknown) =>
  typeof iso === 'string' ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso)) : ''

export function DataTable<T extends { id: string; published?: boolean }>({
  rows, columns, labelKey, basePath, entityLabel, searchKeys, onSetPublished, onDelete,
}: DataTableProps<T>) {
  const uid = useId()
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [pending, startTransition] = useTransition()

  const keys = searchKeys ?? columns.filter((c) => (c.kind ?? 'text') === 'text').map((c) => c.key)
  const visible = rows.filter((r) => matchesQuery(r as Record<string, unknown>, keys, query))
  const labelOf = (r: T) => String(r[labelKey] ?? '')

  function togglePublished(row: T) {
    const next = !(overrides[row.id] ?? row.published ?? false)
    setError(null)
    setBusyId(row.id)
    startTransition(async () => {
      const res = await onSetPublished!(row.id, next)
      setBusyId(null)
      if (!res.ok) return setError(res.error)
      setOverrides((o) => ({ ...o, [row.id]: next })) // reflect only after the server confirmed
      router.refresh()
    })
  }

  function confirmDelete() {
    if (!target) return
    const row = target
    setError(null)
    startTransition(async () => {
      const res = await onDelete!(row.id)
      dialogRef.current?.close()
      setTarget(null)
      if (!res.ok) return setError(res.error)
      router.refresh()
    })
  }

  const cell = (row: T, c: Column<T>) => {
    if (c.render) return c.render(row)
    const v = row[c.key]
    if (c.kind === 'boolean') return v ? 'Yes' : 'No'
    if (c.kind === 'date') return fmtDate(v)
    return v === null || v === undefined ? '' : String(v)
  }

  return (
    <div>
      <div className="mb-3">
        <label htmlFor={`${uid}-q`} className="sr-only">Search {entityLabel}</label>
        <input id={`${uid}-q`} type="search" role="searchbox" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${entityLabel}`} className="w-full max-w-sm rounded border border-navy/30 bg-white px-3 py-2" />
      </div>
      {error && <p role="alert" className="mb-3 rounded bg-blue px-3 py-2 text-sm text-navy">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-navy/10 bg-soft text-black/80">
            <tr>
              {columns.map((c) => <th key={c.key} scope="col" className="px-3 py-2 font-semibold">{c.header}</th>)}
              {onSetPublished && <th scope="col" className="px-3 py-2 font-semibold">Published</th>}
              <th scope="col" className="px-3 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {visible.map((row) => {
              const published = overrides[row.id] ?? row.published ?? false
              return (
                <tr key={row.id}>
                  {columns.map((c, i) =>
                    i === 0 ? <th key={c.key} scope="row" className="px-3 py-2 font-medium">{cell(row, c)}</th>
                      : <td key={c.key} className="px-3 py-2">{cell(row, c)}</td>)}
                  {onSetPublished && (
                    <td className="px-3 py-2">
                      <button type="button" role="switch" aria-checked={published} aria-label={`Publish ${labelOf(row)}`}
                        disabled={busyId === row.id} onClick={() => togglePublished(row)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange disabled:opacity-50 ${published ? 'bg-orange' : 'bg-black/30'}`}>
                        <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                  )}
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Link href={`${basePath}/${row.id}`} className={btn} aria-label={`Edit ${labelOf(row)}`}>Edit</Link>
                      {onDelete && (
                        <button type="button" className={`${btn} text-red-700`} aria-label={`Delete ${labelOf(row)}`}
                          onClick={() => { setTarget(row); dialogRef.current?.showModal() }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr><td colSpan={columns.length + 2} className="px-3 py-6 text-center text-black/70">
                {rows.length === 0 ? `No ${entityLabel} yet.` : `No ${entityLabel} match your search.`}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <dialog ref={dialogRef} aria-labelledby={`${uid}-dlg`} onClose={() => setTarget(null)}
        className="m-auto w-[min(26rem,92vw)] rounded-lg p-0 backdrop:bg-black/50">
        <div className="space-y-4 p-5">
          <h2 id={`${uid}-dlg`} className="font-display text-lg font-semibold text-navy">Delete {target ? labelOf(target) : ''}?</h2>
          <p className="text-sm text-black/80">This permanently removes it and cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button type="button" className={btn} onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button type="button" disabled={pending} onClick={confirmDelete}
              className="rounded bg-red-700 px-3 py-1 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-navy disabled:opacity-50">
              Confirm delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
