import { RevealGroup } from '../anim'
import { MediaImage, MonoLabel, Reveal, Button } from '@/components/site'
import { resolveMediaImage } from '../media-image.helpers'
import type { MediaRef } from '@/lib/queries/types'

/** Two-column text + photo band. The photo column only appears once a photo exists. */
export function DivisionFeature({
  label, title, paragraphs, bullets, media, flip,
}: { label: string; title: string; paragraphs: string[]; bullets?: string[]; media: MediaRef | null; flip?: boolean }) {
  const has = resolveMediaImage(media) !== null
  return (
    <div className={has ? 'grid items-center gap-8 lg:grid-cols-2 lg:gap-12' : ''}>
      <Reveal className={flip && has ? 'lg:order-2' : ''}>
        <MonoLabel>{label}</MonoLabel>
        <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">{title}</h2>
        {paragraphs.map((p) => <p key={p} className="mt-4 max-w-xl text-lg leading-relaxed opacity-85">{p}</p>)}
        {bullets?.length ? (
          <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3 text-sm font-medium">
                <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--accent)]" />
                {b}
              </li>
            ))}
          </ul>
        ) : null}
      </Reveal>
      {has && <MediaImage media={media} aspect="4/3" sizes="(min-width:1024px) 50vw, 100vw" className="rounded-2xl" />}
    </div>
  )
}

export type Route = { id: string; from: string; to: string; blurb: string; stops: string[]; media: MediaRef | null }

/** Radhe Travels intercity routes. Fixed pair: Chandigarh to Jammu, Chandigarh to Dehradun. */
export function RadheRoutes({ routes }: { routes: Route[] }) {
  return (
    <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2">
      {routes.map((r) => {
        const has = resolveMediaImage(r.media) !== null
        return (
          <li key={r.id} className="overflow-hidden rounded-3xl bg-white text-navy shadow-sm ring-1 ring-navy/10">
            {has ? <MediaImage media={r.media} aspect="16/10" sizes="(min-width:768px) 50vw, 100vw" /> : null}
            <div className="p-6 md:p-8">
              <MonoLabel>Intercity route</MonoLabel>
              <h3 className="mt-3 font-display text-3xl font-extrabold uppercase leading-none tracking-tight md:text-4xl">
                {r.from}
                <span aria-hidden="true" className="mx-2 inline-block align-middle text-2xl">→</span>
                <span className="sr-only"> to </span>
                {r.to}
              </h3>
              <p className="mt-4 leading-relaxed opacity-85">{r.blurb}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Along the ${r.from} to ${r.to} route`}>
                {r.stops.map((s) => (
                  <li key={s} className="rounded-full bg-blue px-3 py-1 font-mono text-[11px] uppercase tracking-widest">{s}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Button href="/contact?type=travel">Enquire for {r.to}</Button>
              </div>
            </div>
          </li>
        )
      })}
    </RevealGroup>
  )
}
