import Image from 'next/image'
import { Button, Card, GhostHeadline, MediaImage, MonoLabel, Reveal, SectionShell } from '@/components/site'
import { StatCounter } from '../StatCounter'
import type {
  Division, FleetItem, Milestone, Office, ProjectWithImages, Service, Testimonial, WithMedia, MediaRef,
} from '@/lib/queries/types'
import { RevealGroup } from '../anim'
import { BENTO_GRID, bentoSpan } from '../bento'
import { IndiaMap } from './IndiaMap'
import { resolveMediaImage } from '../media-image.helpers'
import { divisionHref, divisionTheme } from './helpers'

export function Hero({ headline, ctaLabel, ctaHref, media }: { headline: string; ctaLabel: string; ctaHref: string; media: MediaRef | null }) {
  const img = resolveMediaImage(media)
  return (
    <section
      data-page-hero
      style={{ '--outline': '#ffffff' } as React.CSSProperties}
      className="relative isolate flex w-full items-start overflow-hidden bg-black text-white"
    >
      {img ? (
        <Image src={img.src} alt={img.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[70%_center] md:object-center" />
      ) : (
        <div aria-hidden="true" data-media-placeholder className="-z-20 absolute inset-0 bg-[linear-gradient(135deg,#101010,#2a2a2a)]" />
      )}
      <div aria-hidden="true" className="-z-10 absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/85 md:bg-gradient-to-r md:from-black/90 md:via-black/65 md:to-black/25" />
      <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-6 md:px-8 md:pb-14 md:pt-8">
        <MonoLabel>Krishna Trailor Company</MonoLabel>
        <h1 aria-label={`KTC. ${headline}`} className="mt-2">
          <span aria-hidden="true" className="block font-[family-name:var(--font-hero)] text-[clamp(7.5rem,36vw,25rem)] font-bold italic uppercase leading-[0.78] tracking-tighter text-orange [text-shadow:0_6px_0_rgba(0,0,0,0.35),0_18px_40px_rgba(0,0,0,0.55)]">KTC</span>
          <span aria-hidden="true" className="outline-text mt-3 block max-w-4xl font-[family-name:var(--font-hero)] text-[clamp(1.75rem,5.6vw,4.25rem)] uppercase leading-[0.95] tracking-tight">{headline}</span>
        </h1>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={ctaHref}>{ctaLabel}</Button>
          <Button href="/fleet" variant="outline">Our Fleet</Button>
        </div>
      </div>
    </section>
  )
}

export function Intro({ founded, founder }: { founded: string; founder: string | null }) {
  return (
    <SectionShell variant="white" labelledBy="intro-h">
      <Reveal className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <MonoLabel>The Company</MonoLabel>
          <h2 id="intro-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Since {/^\d{4}$/.test(founded) ? <StatCounter value={Number(founded)} grouping={false} className="tabular-nums" /> : founded}</h2>
        </div>
        <p className="text-lg leading-relaxed md:col-span-7 md:text-2xl">
          Krishna Trailor Company was established in {founded}{founder ? ` under ${founder}` : ''} and operates from its head office in Chandigarh,
          with a parallel office in Bhopal.
        </p>
      </Reveal>
    </SectionShell>
  )
}

export function DivisionPanels({ divisions }: { divisions: WithMedia<Division>[] }) {
  return (
    <SectionShell variant="black" labelledBy="div-h" padded={false} contained={false}>
      <h2 id="div-h" className="sr-only">Our divisions</h2>
      <RevealGroup className="grid md:grid-cols-3" y={24}>
        {divisions.map((d, i) => (
          <div key={d.id} data-division={divisionTheme(d.slug)} className="flex min-h-[28rem] flex-col justify-between gap-10 p-8 md:p-10">
            <div>
              <MonoLabel>Division</MonoLabel>
              <h3 className="mt-4 font-display text-3xl font-extrabold uppercase leading-none tracking-tight md:text-4xl">{d.name}</h3>
              {d.tagline && <p className="mt-4 font-mono text-xs uppercase tracking-widest opacity-70">{d.tagline}</p>}
              {d.summary && <p className="mt-5 max-w-sm leading-relaxed">{d.summary}</p>}
            </div>
            <div>
              <MediaImage media={d.media} aspect="16/10" sizes="(min-width:768px) 33vw, 100vw" className={divisionTheme(d.slug) === 'radhe' ? 'mb-6 rounded-2xl' : 'mb-6'} />
              <Button href={divisionHref(d.slug)}>{i === 1 ? 'Enquire' : (d.cta_label ?? 'Get a Quote')}</Button>
            </div>
          </div>
        ))}
      </RevealGroup>
    </SectionShell>
  )
}

export function ServicesGrid({ services }: { services: WithMedia<Service>[] }) {
  return (
    <SectionShell variant="soft" id="services" labelledBy="services-h">
      <MonoLabel>Services</MonoLabel>
      <h2 id="services-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">What we do</h2>
      <RevealGroup as="ul" className={`mt-10 ${BENTO_GRID}`}>
        {services.map((s, i) => (
          <li key={s.id} className={bentoSpan(i, services.length)}>
            <Card variant="light" className="h-full">
              <h3 className="font-display text-xl font-bold uppercase leading-tight">{s.name}</h3>
              {s.summary && <p className="mt-2 text-sm leading-relaxed">{s.summary}</p>}
            </Card>
          </li>
        ))}
      </RevealGroup>
    </SectionShell>
  )
}

export function HeavyMachinery({ services }: { services: WithMedia<Service>[] }) {
  return (
    <SectionShell variant="white" labelledBy="mach-h">
      <MonoLabel>Heavy Machinery</MonoLabel>
      <h2 id="mach-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Cranes. Forklifts. Excavators.</h2>
      <RevealGroup className="mt-8 grid gap-4 md:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-xl bg-soft">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <MediaImage media={s.media} aspect="4/3" sizes="(min-width:768px) 33vw, 100vw" />
            </div>
            <div className="p-4">
              <p className="font-display text-lg font-bold uppercase">{s.name}</p>
            </div>
          </div>
        ))}
      </RevealGroup>
    </SectionShell>
  )
}

export function HaulageShowcase({ headline, media, services }: { headline: string; media: MediaRef | null; services: Service[] }) {
  return (
    <div data-division="haulage">
      <SectionShell variant="black" labelledBy="haul-h">
        <MonoLabel>Heavy Haulage</MonoLabel>
        <div aria-hidden="true"><GhostHeadline as="p" on="dark" className="mt-6">{headline}</GhostHeadline></div>
        <h2 id="haul-h" className="sr-only">{headline}</h2>
        <Reveal className="mt-8 grid gap-10 md:grid-cols-2">
          <MediaImage media={media} aspect="16/9" sizes="(min-width:768px) 50vw, 100vw" />
          <ul className="space-y-3 font-mono text-sm uppercase tracking-wider">
            {services.map((s) => (
              <li key={s.id} className="border-b border-white/15 pb-3">{s.name}</li>
            ))}
          </ul>
        </Reveal>
        <div className="mt-10"><Button href="/heavy-haulage">Heavy Haulage</Button></div>
      </SectionShell>
    </div>
  )
}

export function FleetStrip({ items }: { items: WithMedia<FleetItem>[] }) {
  return (
    <SectionShell variant="white" labelledBy="fleet-h">
      <MonoLabel>Fleet</MonoLabel>
      <h2 id="fleet-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Our fleet</h2>
      <RevealGroup as="ul" className={`mt-10 ${BENTO_GRID}`}>
        {items.map((f, i) => (
          <li key={f.id} className={`overflow-hidden rounded-xl bg-soft ${bentoSpan(i, items.length)}`}>
            <div className="aspect-[4/3] w-full overflow-hidden">
              <MediaImage media={f.media} aspect="4/3" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
            </div>
            <div className="p-4">
              <p className="font-display text-lg font-bold uppercase">{f.name}</p>
              {f.capacity && <p className="font-mono text-xs uppercase opacity-70">{f.capacity}</p>}
            </div>
          </li>
        ))}
      </RevealGroup>
      <div className="mt-10"><Button href="/fleet" variant="dark">View full fleet</Button></div>
    </SectionShell>
  )
}

export function TimelineSection({ items }: { items: Milestone[] }) {
  return (
    <SectionShell variant="soft" labelledBy="tl-h">
      <MonoLabel>Our Story</MonoLabel>
      <h2 id="tl-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Timeline</h2>
      <ol className="mt-10 border-l-2 border-orange/40">
        {items.map((m) => (
          <Reveal as="li" key={m.id} className="relative pb-6 pl-8 last:pb-0">
            <span aria-hidden="true" className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-orange ring-4 ring-[var(--color-soft)]" />
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-orange-text">{m.year}</p>
            <h3 className="mt-0.5 font-display text-xl font-bold uppercase">{m.title}</h3>
            {m.description && <p className="mt-1 max-w-2xl text-sm leading-relaxed opacity-80">{m.description}</p>}
          </Reveal>
        ))}
      </ol>
    </SectionShell>
  )
}

export function PanIndia({ offices }: { offices: Office[] }) {
  return (
    <SectionShell variant="black" labelledBy="map-h">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <Reveal>
          <MonoLabel>Pan-India</MonoLabel>
          <h2 id="map-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Pan-India reach</h2>
          <ul className="mt-8 space-y-4">
            {offices.map((o) => (
              <li key={o.id}>
                <p className="font-display text-xl font-bold uppercase">{o.name}</p>
                {o.address && <p className="text-sm opacity-80">{o.address}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-white/20 pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/70">Radhe Travels routes</p>
            <ul className="mt-3 space-y-1 font-display text-lg font-bold uppercase">
              <li>Chandigarh to Jammu</li>
              <li>Chandigarh to Dehradun</li>
            </ul>
            <div className="mt-5"><Button href="/radhe-travels" variant="outline">See bus routes</Button></div>
          </div>
        </Reveal>
        <IndiaMap offices={offices} />
      </div>
    </SectionShell>
  )
}

export function ProjectsGallery({ projects }: { projects: ProjectWithImages[] }) {
  return (
    <SectionShell variant="white" labelledBy="proj-h">
      <MonoLabel>Projects</MonoLabel>
      <h2 id="proj-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Recent projects</h2>
      <RevealGroup as="ul" className={`mt-10 ${BENTO_GRID}`}>
        {projects.map((p, i) => (
          <li key={p.id} className={`overflow-hidden rounded-xl bg-soft ${bentoSpan(i, projects.length)}`}>
            <div className="aspect-[4/3] w-full overflow-hidden">
              <MediaImage media={p.media ?? p.images[0]?.media ?? null} aspect="4/3" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
            </div>
            <div className="p-4">
              <h3 className="font-display text-lg font-bold uppercase">{p.title}</h3>
              {p.location && <p className="font-mono text-xs uppercase opacity-70">{p.location}</p>}
            </div>
          </li>
        ))}
      </RevealGroup>
      <div className="mt-10"><Button href="/projects" variant="dark">All projects</Button></div>
    </SectionShell>
  )
}

export function WhyUs({ headline, points }: { headline: string; points: { title: string; body: string | null }[] }) {
  return (
    <SectionShell variant="black" labelledBy="why-h">
      <MonoLabel>Why Us</MonoLabel>
      <h2 id="why-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">{headline}</h2>
      <RevealGroup as="ul" className="mt-8 grid gap-6 md:grid-cols-3">
        {points.map((p) => (
          <li key={p.title} className="border-t border-white/30 pt-4">
            <h3 className="font-display text-xl font-bold uppercase">{p.title}</h3>
            {p.body && <p className="mt-2 opacity-80">{p.body}</p>}
          </li>
        ))}
      </RevealGroup>
    </SectionShell>
  )
}

export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  return (
    <SectionShell variant="soft" labelledBy="testi-h">
      <MonoLabel>Testimonials</MonoLabel>
      <h2 id="testi-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Client words</h2>
      <RevealGroup as="ul" className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((t) => (
          <Card as="li" key={t.id} variant="light">
            <blockquote className="text-lg leading-relaxed">“{t.quote}”</blockquote>
            <p className="mt-4 font-mono text-xs uppercase">{t.author_name}{t.company ? `, ${t.company}` : ''}</p>
          </Card>
        ))}
      </RevealGroup>
    </SectionShell>
  )
}

export function FinalCta({ label, href }: { label: string; href: string }) {
  return (
    <SectionShell variant="black" labelledBy="cta-h">
      <MonoLabel>Contact</MonoLabel>
      <div aria-hidden="true"><GhostHeadline as="p" on="dark" className="mt-6">Let’s move it.</GhostHeadline></div>
      <h2 id="cta-h" className="sr-only">Get in touch</h2>
      <div className="mt-10"><Button href={href}>{label}</Button></div>
    </SectionShell>
  )
}

export function StatsBand({ founded, divisions, offices, fleet }: { founded: string | null; divisions: number; offices: number; fleet: number }) {
  const stats: { value: number; label: string; grouping?: boolean }[] = [
    ...(founded && /^\d{4}$/.test(founded) ? [{ value: Number(founded), label: 'Established', grouping: false }] : []),
    { value: divisions, label: 'Divisions' },
    { value: offices, label: 'Offices' },
    { value: fleet, label: 'Fleet categories' },
  ].filter((x) => x.value > 0)
  if (stats.length === 0) return null
  return (
    <SectionShell variant="black" padded={false} labelledBy="stats-h">
      <h2 id="stats-h" className="sr-only">KTC at a glance</h2>
      <ul className="grid grid-cols-2 divide-white/15 py-8 md:grid-cols-4 md:divide-x md:py-10">
        {stats.map((st) => (
          <li key={st.label} className="px-2 py-3 text-center md:px-6">
            <p className="font-[family-name:var(--font-hero)] text-4xl leading-none md:text-6xl"><StatCounter value={st.value} grouping={st.grouping ?? true} className="tabular-nums" /></p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">{st.label}</p>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

export type IndustryTile = { title: string; body: string; media: MediaRef | null }

export function Industries({ tiles }: { tiles: IndustryTile[] }) {
  return (
    <SectionShell variant="white" labelledBy="ind-h" className="!py-14 md:!py-20">
      <MonoLabel>Industries</MonoLabel>
      <h2 id="ind-h" className="mt-3 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Loads we move</h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-black/75">From factory floor to project site: the heavy, tall and awkward cargo that ordinary carriers turn away.</p>
      <RevealGroup as="ul" className={`mt-8 ${BENTO_GRID}`}>
        {tiles.map((t, i) => {
          const has = resolveMediaImage(t.media) !== null
          return (
            <li key={t.title} className={`group relative isolate flex min-h-60 flex-col justify-end overflow-hidden rounded-xl bg-black text-white ${bentoSpan(i, tiles.length)}`}>
              {has && <MediaImage media={t.media} aspect="4/3" sizes="(min-width:1024px) 50vw, 100vw" className="!absolute inset-0 -z-10 !h-full !aspect-auto transition-transform duration-500 group-hover:scale-105" />}
              <div className={`p-6 ${has ? 'bg-gradient-to-t from-black/90 via-black/55 to-transparent pt-20' : ''}`}>
                <h3 className="font-display text-xl font-bold uppercase leading-tight">{t.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">{t.body}</p>
              </div>
            </li>
          )
        })}
      </RevealGroup>
    </SectionShell>
  )
}

export function Process({ steps, media }: { steps: { title: string; body: string }[]; media: MediaRef | null }) {
  const has = resolveMediaImage(media) !== null
  return (
    <SectionShell variant="soft" labelledBy="proc-h" className="!py-14 md:!py-20">
      <div className={has ? 'grid items-center gap-10 lg:grid-cols-2' : ''}>
        <div>
          <MonoLabel>How it works</MonoLabel>
          <h2 id="proc-h" className="mt-3 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">From enquiry to delivery</h2>
          <ol className="mt-8 space-y-5">
            {steps.map((st, i) => (
              <Reveal as="li" key={st.title} className="flex gap-4">
                <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black font-mono text-xs font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase leading-tight">{st.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-black/75">{st.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
        {has && <MediaImage media={media} aspect="4/3" sizes="(min-width:1024px) 50vw, 100vw" className="rounded-xl" />}
      </div>
    </SectionShell>
  )
}
