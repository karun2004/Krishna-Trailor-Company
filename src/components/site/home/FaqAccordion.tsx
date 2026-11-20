'use client'
import { useId, useState } from 'react'
import type { Faq } from '@/lib/queries/types'

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const base = useId()
  const [open, setOpen] = useState<string | null>(null)
  return (
    <ul className="divide-y divide-navy/20 border-y border-navy/20">
      {faqs.map((f) => {
        const isOpen = open === f.id
        const bid = `${base}-b-${f.id}`
        const pid = `${base}-p-${f.id}`
        return (
          <li key={f.id}>
            <h3>
              <button
                type="button"
                id={bid}
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy md:text-xl"
              >
                <span>{f.question}</span>
                <span aria-hidden="true" className="font-mono text-2xl leading-none">{isOpen ? '−' : '+'}</span>
              </button>
            </h3>
            <div id={pid} role="region" aria-labelledby={bid} hidden={!isOpen} className="pb-6 pr-10 text-base leading-relaxed">
              {f.answer}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
