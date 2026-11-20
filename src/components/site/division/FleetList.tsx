import { MediaImage } from '@/components/site'
import type { FleetItem, WithMedia } from '@/lib/queries/types'

function specs(s: Record<string, unknown>) {
  return Object.entries(s ?? {}).filter(([, v]) => ['string', 'number'].includes(typeof v) && String(v).trim() !== '')
}

export function FleetList({ items, tone }: { items: WithMedia<FleetItem>[]; tone: 'light' | 'dark' | 'radhe' }) {
  const card = tone === 'dark' ? 'border border-white/15 bg-white/[0.03]' : tone === 'radhe' ? 'rounded-3xl bg-white text-[#14243a]' : 'border border-black/15 bg-white text-black'
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f) => {
        const sp = specs(f.specifications)
        return (
          <li key={f.id} className={`overflow-hidden ${tone === 'radhe' ? '' : 'rounded-sm'} ${card}`}>
            {f.media ? <MediaImage media={f.media} aspect="16/10" sizes="(min-width:1024px) 33vw, 100vw" /> : null}
            <div className="p-5">
              <h3 className="font-display text-lg font-bold uppercase">{f.name}</h3>
              {f.capacity ? <p className={`mt-1 text-sm ${tone === 'dark' ? 'font-mono' : ''} opacity-70`}>{f.capacity}</p> : null}
              {f.description ? <p className="mt-2 text-sm opacity-80">{f.description}</p> : null}
              {sp.length ? (
                <dl className={`mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm ${tone === 'dark' ? 'font-mono' : ''}`}>
                  {sp.map(([k, v]) => (<div key={k} className="contents"><dt className="opacity-60">{k.replace(/_/g, ' ')}</dt><dd>{String(v)}</dd></div>))}
                </dl>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
