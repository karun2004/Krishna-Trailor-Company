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
import {
  DivisionPanels, FinalCta, FleetStrip, HaulageShowcase, Hero, HeavyMachinery, Intro, PanIndia,
  ProjectsGallery, ServicesGrid, TestimonialsSection, TimelineSection, WhyUs,
} from '@/components/site/home/Sections'

export const dynamic = 'force-dynamic'
export const generateMetadata = () =>
  buildMetadata('home', { title: 'Krishna Trailor Company', description: 'Trailer transport and heavy haulage from Manimajra, Chandigarh. Founded in 1987.', path: '/' })

export default async function Home() {
  const [blocks, settings, services, fleet, projects, timeline, offices, testimonials, faqs, d1, d2, d3] = await Promise.all([
    getPageContent('home'), getSiteSettings(), getServices(), getFleetItems(), getProjects({ limit: 6 }),
    getTimeline(), getOffices(), getTestimonials(), getFaqs(),
    getDivision('krishna-trailor'), getDivision('heavy-machinery'), getDivision('radhe-travels'),
  ])
  const divisions = [d1, d2, d3].filter((d) => d !== null)

  const hero = blocks.hero
  const headline = str(hero?.content, 'headline') ?? d1?.tagline ?? 'Krishna Trailor Company'
  const ctaLabel = str(hero?.content, 'cta_label') ?? 'Get a Quote'
  const ctaHref = str(hero?.content, 'cta_href') ?? '/contact'
  const company = (settings.company ?? {}) as Record<string, unknown>
  const founded = typeof company.founded === 'string' ? company.founded : null
  const founder = typeof company.founder === 'string' ? company.founder : null

  const machinery = services.filter((s) => s.category === 'machinery')
  const haulageServices = services.filter((s) => s.category === 'haulage')
  const showcase = blocks.haulage_showcase
  const showcaseHeadline = str(showcase?.content, 'headline')
  const why = blocks.why_us
  const whyPoints = list(why?.content, 'points')
  const whyHeadline = str(why?.content, 'headline')

  return (
    <>
      <JsonLd data={buildLocalBusinessJsonLd(settings, offices, siteUrl())} />
      <Hero headline={headline} ctaLabel={ctaLabel} ctaHref={ctaHref} media={hero?.media ?? d1?.media ?? null} />
      {founded && <Intro founded={founded} founder={founder} />}
      {divisions.length > 0 && <DivisionPanels divisions={divisions} />}
      {services.length > 0 && <ServicesGrid services={services} />}
      {machinery.length > 0 && <HeavyMachinery services={machinery} />}
      {showcaseHeadline && <HaulageShowcase headline={showcaseHeadline} media={showcase?.media ?? null} services={haulageServices} />}
      {fleet.length > 0 && <FleetStrip items={fleet} />}
      {timeline.length > 0 && <TimelineSection items={timeline} />}
      {offices.length > 0 && <PanIndia offices={offices} />}
      {projects.length > 0 && <ProjectsGallery projects={projects} />}
      {whyHeadline && whyPoints.length > 0 && <WhyUs headline={whyHeadline} points={whyPoints} />}
      {testimonials.length > 0 && <TestimonialsSection items={testimonials} />}
      {faqs.length > 0 && (
        <SectionShell variant="blue" labelledBy="faq-h">
          <MonoLabel index={12}>FAQ</MonoLabel>
          <h2 id="faq-h" className="mt-4 mb-10 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">Questions</h2>
          <FaqAccordion faqs={faqs} />
        </SectionShell>
      )}
      <FinalCta label={ctaLabel} href="/contact" />
    </>
  )
}
