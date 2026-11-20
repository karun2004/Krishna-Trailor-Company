import { RevealGroup } from '../anim'
import { Card, MonoLabel } from '@/components/site'
import type { Service, WithMedia } from '@/lib/queries/types'

export function ServiceList({ services, tone }: { services: WithMedia<Service>[]; tone: 'editorial' | 'mono' | 'soft' }) {
  if (tone === 'editorial') {
    return (
      <RevealGroup as="ol" className="divide-y divide-black/15 border-y border-black/15">
        {services.map((s, i) => (
          <li key={s.id} className="grid gap-2 py-6 md:grid-cols-[6rem_1fr_2fr] md:items-baseline">
            <span className="font-mono text-xs tracking-[0.18em] text-black/70">{String(i + 1).padStart(2, '0')}</span>
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
        {services.map((s, i) => (
          <li key={s.id} className="bg-[#0a0a0a] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">SVC-{String(i + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 font-display text-xl font-bold uppercase">{s.name}</h3>
            {s.summary ? <p className="mt-2 text-sm text-white/70">{s.summary}</p> : null}
          </li>
        ))}
      </RevealGroup>
    )
  }
  return (
    <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2">
      {services.map((s, i) => (
        <Card key={s.id} as="li" variant="blue" className="rounded-3xl">
          <MonoLabel index={i + 1}>Service</MonoLabel>
          <h3 className="mt-3 font-display text-xl font-bold">{s.name}</h3>
          {s.summary ? <p className="mt-2 opacity-80">{s.summary}</p> : null}
        </Card>
      ))}
    </RevealGroup>
  )
}
