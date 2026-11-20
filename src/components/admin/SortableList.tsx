'use client'

import { useState, useTransition } from 'react'
import { moveItem, type ActionResult } from '@/lib/admin/fields'

export type SortableItem = { id: string; label: string; hint?: string }
export type SortableListProps = {
  items: SortableItem[]
  /** Server Action: persists sort_order = index for the given id order. */
  onReorder: (orderedIds: string[]) => Promise<ActionResult>
  /** Accessible name for the list, e.g. "Service order". */
  label: string
}

const btn =
  'rounded border border-navy/20 px-2 py-1 text-sm text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange disabled:opacity-40'

/** Ordered list with up/down buttons; each move persists immediately via onReorder. No DnD dependency. */
export function SortableList({ items, onReorder, label }: SortableListProps) {
  const [list, setList] = useState(items)
  // Adopt a new server-provided order (after revalidation) without remounting, so the status message survives.
  const signature = items.map((i) => i.id).join(',')
  const [seen, setSeen] = useState(signature)
  if (signature !== seen) {
    setSeen(signature)
    setList(items)
  }
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [pending, startTransition] = useTransition()

  function move(index: number, delta: -1 | 1) {
    const prev = list
    const next = moveItem(list, index, delta)
    setList(next)
    setMsg('')
    setErr('')
    startTransition(async () => {
      const res = await onReorder(next.map((i) => i.id))
      if (res.ok) setMsg('Order saved')
      else {
        setList(prev)
        setErr(res.error)
      }
    })
  }

  return (
    <div>
      <ol aria-label={label} className="divide-y divide-navy/10 rounded-lg border border-navy/10 bg-white">
        {list.map((item, i) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="min-w-0 truncate text-sm">
              {item.label}
              {item.hint && <span className="text-black/70"> · {item.hint}</span>}
            </span>
            <span className="flex shrink-0 gap-1">
              <button type="button" className={btn} disabled={pending || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${item.label} up`}>
                <span aria-hidden="true">↑</span>
              </button>
              <button type="button" className={btn} disabled={pending || i === list.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${item.label} down`}>
                <span aria-hidden="true">↓</span>
              </button>
            </span>
          </li>
        ))}
      </ol>
      <p role="status" className="mt-2 min-h-5 text-sm text-black/70">{msg}</p>
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
    </div>
  )
}
