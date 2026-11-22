import {
  getDivision, getFaqs, getFleetItems, getOffices, getPageContent, getProjects, getServices,
  getSiteSettings, getTestimonials, getTimeline,
} from '@/lib/queries'
import { SectionShell, MonoLabel } from '@/components/site'
import { JsonLd } from '@/components/site/JsonLd'
import { buildLocalBusinessJsonLd } from '@/lib/jsonld'
import { buildMetadata, siteUrl } from '@/lib/seo'
import { FaqAccordion } from '@/components/site/home/FaqAccordion'
import { list, str } from '@/components/site/home/helpers'
import { CustomSections } from '@/components/site/CustomSections'
import { getSlots, withFallback } from '@/lib/queries/slots'
import { DIVISION_FALLBACK, FLEET_FALLBACK } from '@/lib/media-slots'
import {
  DivisionPanels, FinalCta, FleetStrip, HaulageShowcase, Hero, Industries, Intro, PanIndia, Process,
  ProjectsGallery, ServicesGrid, StatsBand, TestimonialsSection, TimelineSection, WhyUs,
} from '@/components/site/home/Sections'

export const dynamic = 'force-dynamic'

const INDUSTRIES = [
  { title: 'Power and transformers', body: 'Transformers, switchgear and heavy electrical plant moved on multi-axle hydraulic trailers.' },
  { title: 'Wind and renewables', body: 'Tower sections, nacelles and blades: long, tall loads that need route planning.' },
  { title: 'Construction and infrastructure', body: 'Rollers, pavers, cranes and earth-movers delivered to site, ready to work.' },
  { title: 'Mining and quarry', body: 'Excavators, dumpers and crushers carried over long distances without damage.' },
]
const PROCESS = [
  { title: 'Tell us the load', body: 'Share the weight, dimensions, pick-up and drop. We confirm what trailer fits.' },
  { title: 'Plan the route', body: 'Route check, permits where needed, and the right prime mover and trailer assigned.' },
  { title: 'Load and secure', body: 'Our crew loads, lashes and checks the cargo before the vehicle leaves the yard.' },
  { title: 'Move and deliver', body: 'Experienced drivers carry it through, with updates until it reaches the site.' },
]
export const generateMetadata = () =>
  buildMetadata('home', { title: 'Krishna Trailor Company', description: 'Trailer transport and heavy haulage from Manimajra, Chandigarh. Founded in 1987.', path: '/' })

export default async function Home() {
  const slot = await getSlots('home')
  const [blocks, settings, services, fleet, projects, timeline, offices, testimonials, faqs, d1, d2, d3] = await Promise.all([
    getPageContent('home'), getSiteSettings(), getServices(), getFleetItems(), getProjects({ limit: 6 }),
    getTimeline(), getOffices(), getTestimonials(), getFaqs(),
    getDivision('krishna-trailor'), getDivision('heavy-machinery'), getDivision('radhe-travels'),
  ])
  const divisions = [d1, d2, d3].filter((d) => d !== null).map((d) => ({ ...d, media: withFallback(d.media, DIVISION_FALLBACK[d.slug], d.name) }))

  const hero = blocks.hero
  const headline = str(hero?.content, 'headline') ?? d1?.tagline ?? 'Krishna Trailor Company'
  const ctaLabel = str(hero?.content, 'cta_label') ?? 'Get a Quote'
  const ctaHref = str(hero?.content, 'cta_href') ?? '/contact'
  const company = (settings.company ?? {}) as Record<string, unknown>
  const founded = typeof company.founded === 'string' ? company.founded : null
  const founder = typeof company.founder === 'string' ? company.founder : null

    const haulageServices = services.filter((s) => s.category === 'haulage')
  const showcase = blocks.haulage_showcase
  const showcaseHeadline = str(showcase?.content, 'headline')
  const why = blocks.why_us
  const whyPoints = list(why?.content, 'points')
  const whyHeadline = str(why?.content, 'headline')

  return (
    <>
      <JsonLd data={buildLocalBusinessJsonLd(settings, offices, siteUrl())} />
      <Hero headline={headline} ctaLabel={ctaLabel} ctaHref={ctaHref} media={slot('hero') ?? d1?.media ?? null} />
      <CustomSections page="home" placement="top" />
      <StatsBand founded={founded} divisions={divisions.length} offices={offices.length} fleet={new Set(fleet.map((f) => f.category)).size} />
      {founded && <Intro founded={founded} founder={founder} />}
      {divisions.length > 0 && <DivisionPanels divisions={divisions} />}
      {services.length > 0 && <ServicesGrid services={services} />}
      <Industries tiles={INDUSTRIES.map((t, i) => ({ ...t, media: slot(`industry_${i + 1}`) }))} />
      <Process steps={PROCESS} media={slot('process')} />
      {showcaseHeadline && <HaulageShowcase headline={showcaseHeadline} media={slot('haulage_showcase')} services={haulageServices} />}
      {fleet.length > 0 && <FleetStrip items={fleet.map((f) => ({ ...f, media: withFallback(f.media, FLEET_FALLBACK[f.category], f.name) }))} />}
      {timeline.length > 0 && <TimelineSection items={timeline} />}
      {offices.length > 0 && <PanIndia offices={offices} />}
      {projects.length > 0 && <ProjectsGallery projects={projects} />}
      {whyHeadline && whyPoints.length > 0 && <WhyUs headline={whyHeadline} points={whyPoints} />}
      {testimonials.length > 0 && <TestimonialsSection items={testimonials} />}
      {faqs.length > 0 && (
        <SectionShell variant="blue" labelledBy="faq-h">
          <MonoLabel>FAQ</MonoLabel>
          <h2 id="faq-h" className="mt-4 mb-10 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Questions</h2>
          <FaqAccordion faqs={faqs} />
        </SectionShell>
      )}
      <CustomSections page="home" placement="bottom" />
      <FinalCta label={ctaLabel} href="/contact" />
    </>
  )
}
