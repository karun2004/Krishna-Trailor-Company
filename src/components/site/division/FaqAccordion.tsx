import type { Faq } from '@/lib/queries/types'

/** Native <details> accordion: no JS, keyboard accessible. */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-current/15 border-y border-current/15">
      {faqs.map((f) => (
        <details key={f.id} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {f.question}
            <span aria-hidden className="font-mono text-xl transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-3xl whitespace-pre-line opacity-80">{f.answer}</p>
        </details>
      ))}
    </div>
  )
}
