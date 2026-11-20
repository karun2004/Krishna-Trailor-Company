import { Button, Card, GhostHeadline, MediaImage, MonoLabel, Reveal, SectionShell } from '@/components/site'
import { StatCounter } from '../StatCounter'
import type {
  Division, FleetItem, Milestone, Office, ProjectWithImages, Service, Testimonial, WithMedia, MediaRef,
} from '@/lib/queries/types'
import { HeroScrub, RevealGroup } from '../anim'
import { IndiaMap } from './IndiaMap'
import { resolveMediaImage } from '../media-image.helpers'
import { divisionHref, divisionTheme } from './helpers'

export function Hero({ headline, ctaLabel, ctaHref, media }: { headline: string; ctaLabel: string; ctaHref: string; media: MediaRef | null }) {
  const hasMedia = resolveMediaImage(media) !== null
  return (
    <SectionShell variant="black" className="relative !py-0" contained={false}>
      <HeroScrub vehicle={hasMedia ? <MediaImage media={media} aspect="16/9" sizes="(min-width:768px) 62vw, 85vw" priority className="rounded-sm" /> : null}>
        <MonoLabel index={1}>Krishna Trailor Company</MonoLabel>
        <GhostHeadline as="h1" on="dark" className="mt-6 max-w-5xl">{headline}</GhostHeadline>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={ctaHref}>{ctaLabel}</Button>
          <Button href="/fleet" variant="outline">Our Fleet</Button>
        </div>
      </HeroScrub>
    </SectionShell>
  )
}

export function Intro({ founded, founder }: { founded: string; founder: string | null }) {
  return (
    <SectionShell variant="white" labelledBy="intro-h">
      <Reveal className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <MonoLabel index={2}>The Company</MonoLabel>
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
              <MonoLabel index={i + 1}>Division</MonoLabel>
              <h3 className="mt-4 font-display text-3xl font-extrabold uppercase leading-none tracking-tight md:text-4xl">{d.name}</h3>
              {d.tagline && <p className="mt-4 font-mono text-xs uppercase tracking-widest opacity-70">{d.tagline}</p>}
              {d.summary && <p className="mt-5 max-w-sm leading-relaxed">{d.summary}</p>}
            </div>
            <div>
              <MediaImage media={d.media} aspect="16/10" sizes="(min-width:768px) 33vw, 100vw" className={divisionTheme(d.slug) === 'radhe' ? 'mb-6 rounded-2xl' : 'mb-6'} />
              <Button href={divisionHref(d.slug)}>{d.cta_label ?? 'Explore'}</Button>
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
      <MonoLabel index={3}>Services</MonoLabel>
      <h2 id="services-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">What we do</h2>
      <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <li key={s.id}>
            <Card variant="light" className="h-full">
              <span className="font-mono text-xs opacity-60">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-display text-xl font-bold uppercase leading-tight">{s.name}</h3>
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
      <MonoLabel index={4}>Heavy Machinery</MonoLabel>
      <h2 id="mach-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Cranes. Forklifts. Excavators.</h2>
      <RevealGroup className="mt-12 grid gap-4 md:grid-cols-3">
        {services.map((s) => (
          <div key={s.id}>
            <MediaImage media={s.media} aspect="4/3" sizes="(min-width:768px) 33vw, 100vw" />
            <p className="mt-3 font-display text-lg font-bold uppercase">{s.name}</p>
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
        <MonoLabel index={5}>Heavy Haulage</MonoLabel>
        <div aria-hidden="true"><GhostHeadline as="p" on="dark" className="mt-6">{headline}</GhostHeadline></div>
        <h2 id="haul-h" className="sr-only">{headline}</h2>
        <Reveal className="mt-12 grid gap-10 md:grid-cols-2">
          <MediaImage media={media} aspect="16/9" sizes="(min-width:768px) 50vw, 100vw" />
          <ul className="space-y-3 font-mono text-sm uppercase tracking-wider">
            {services.map((s, i) => (
              <li key={s.id} className="flex gap-4 border-b border-white/15 pb-3"><span className="text-orange">{String(i + 1).padStart(2, '0')}</span>{s.name}</li>
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
      <MonoLabel index={6}>Fleet</MonoLabel>
      <h2 id="fleet-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Our fleet</h2>
      <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <li key={f.id}>
            <MediaImage media={f.media} aspect="4/3" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
            <p className="mt-3 font-display text-lg font-bold uppercase">{f.name}</p>
            {f.capacity && <p className="font-mono text-xs uppercase opacity-70">{f.capacity}</p>}
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
      <MonoLabel index={7}>Our Story</MonoLabel>
      <h2 id="tl-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Timeline</h2>
      <ol className="mt-12 border-l border-black/30">
        {items.map((m) => (
          <Reveal as="li" key={m.id} className="relative pb-10 pl-8 last:pb-0">
            <span aria-hidden="true" className="absolute -left-[5px] top-2 size-[9px] bg-orange" />
            <p className="font-mono text-sm uppercase tracking-widest">{m.year}</p>
            <h3 className="mt-1 font-display text-2xl font-bold uppercase">{m.title}</h3>
            {m.description && <p className="mt-2 max-w-2xl leading-relaxed">{m.description}</p>}
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
          <MonoLabel index={8}>Pan-India</MonoLabel>
          <h2 id="map-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Pan-India reach</h2>
          <ul className="mt-8 space-y-4">
            {offices.map((o) => (
              <li key={o.id}>
                <p className="font-display text-xl font-bold uppercase">{o.name}</p>
                {o.address && <p className="text-sm opacity-80">{o.address}</p>}
              </li>
            ))}
          </ul>
        </Reveal>
        <IndiaMap offices={offices} />
      </div>
    </SectionShell>
  )
}

export function ProjectsGallery({ projects }: { projects: ProjectWithImages[] }) {
  return (
    <SectionShell variant="white" labelledBy="proj-h">
      <MonoLabel index={9}>Projects</MonoLabel>
      <h2 id="proj-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Recent projects</h2>
      <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <li key={p.id}>
            <MediaImage media={p.media ?? p.images[0]?.media ?? null} aspect="4/3" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
            <h3 className="mt-3 font-display text-lg font-bold uppercase">{p.title}</h3>
            {p.location && <p className="font-mono text-xs uppercase opacity-70">{p.location}</p>}
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
      <MonoLabel index={10}>Why Us</MonoLabel>
      <h2 id="why-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">{headline}</h2>
      <RevealGroup as="ul" className="mt-12 grid gap-6 md:grid-cols-3">
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
      <MonoLabel index={11}>Testimonials</MonoLabel>
      <h2 id="testi-h" className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Client words</h2>
      <RevealGroup as="ul" className="mt-12 grid gap-4 md:grid-cols-2">
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
      <MonoLabel index={13}>Contact</MonoLabel>
      <div aria-hidden="true"><GhostHeadline as="p" on="dark" className="mt-6">Let’s move it.</GhostHeadline></div>
      <h2 id="cta-h" className="sr-only">Get in touch</h2>
      <div className="mt-10"><Button href={href}>{label}</Button></div>
    </SectionShell>
  )
}
