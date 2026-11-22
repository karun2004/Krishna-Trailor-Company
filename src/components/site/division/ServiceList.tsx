import { RevealGroup } from '../anim'
import { Card, MonoLabel } from '@/components/site'
import type { Service, WithMedia } from '@/lib/queries/types'

export function ServiceList({ services, tone, quote }: { services: WithMedia<Service>[]; tone: 'editorial' | 'mono' | 'soft'; quote?: { text: string; by: string } }) {
  if (tone === 'editorial') {
    return (
      <RevealGroup as="ol" className="divide-y divide-black/15 border-y border-black/15">
        {services.map((s) => (
          <li key={s.id} className="grid gap-2 py-6 md:grid-cols-[1fr_2fr] md:items-baseline">
            <h3 className="font-display text-2xl font-bold uppercase leading-tight">{s.name}</h3>
            {s.summary ? <p className="text-black/70">{s.summary}</p> : <span />}
          </li>
        ))}
      </RevealGroup>
    )
  }
  if (tone === 'mono') {
    return (
      <RevealGroup as="ul" className="grid gap-px bg-white/15 sm:grid-cols-2">
        {services.map((s) => (
          <li key={s.id} className="bg-[#0a0a0a] p-6">
            <h3 className="mt-3 font-display text-xl font-bold uppercase">{s.name}</h3>
            {s.summary ? <p className="mt-2 text-sm text-white/70">{s.summary}</p> : null}
          </li>
        ))}
      </RevealGroup>
    )
  }
  return (
    <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2">
      {services.map((s) => (
        <Card key={s.id} as="li" variant="blue" className="rounded-3xl">
          <MonoLabel>Service</MonoLabel>
          <h3 className="mt-3 font-display text-xl font-bold">{s.name}</h3>
          {s.summary ? <p className="mt-2 opacity-80">{s.summary}</p> : null}
        </Card>
      ))}
      {quote && services.length % 2 === 1 ? (
        <li className="flex flex-col justify-center rounded-3xl bg-navy p-8 text-white sm:max-lg:col-span-1">
          <span aria-hidden="true" className="font-[family-name:var(--font-hero)] text-6xl leading-none text-white/40">“</span>
          <blockquote className="-mt-3 font-display text-xl font-bold leading-snug md:text-2xl">{quote.text}</blockquote>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">{quote.by}</p>
        </li>
      ) : null}
    </RevealGroup>
  )
}
