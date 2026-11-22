import { CustomSections } from '@/components/site/CustomSections'
import { Button, MonoLabel, PageHero, SectionShell } from '@/components/site'
import { DivisionCta, FaqAccordion, RadheRoutes, FleetList, ProjectsStrip, ServiceList, loadDivisionPage } from '@/components/site/division'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 60
export const generateMetadata = () => buildMetadata('radhe-travels', { title: 'Radhe Travels', description: 'Radhe Travels, the passenger bus travel division of Krishna Trailor Company.', path: '/radhe-travels' })

const ROUTES = [
  { id: 'jammu', from: 'Chandigarh', to: 'Jammu', blurb: 'Daily-style intercity service from Chandigarh towards Jammu, on the northern highway through Punjab.', stops: ['Chandigarh', 'Punjab', 'Pathankot', 'Jammu'] },
  { id: 'dehradun', from: 'Chandigarh', to: 'Dehradun', blurb: 'Comfortable coach travel from Chandigarh to Dehradun, running along the Shivalik foothills.', stops: ['Chandigarh', 'Foothills', 'Dehradun'] },
] as const

export default async function RadheTravelsPage() {
  const { slot, heroMedia, division, services, fleet, faqs, projects, phones, intro } = await loadDivisionPage('radhe')
  const summary = intro ?? division?.summary ?? undefined
  return (
    <div data-division="radhe">
      <PageHero tone="light" label={division?.tagline ?? 'Passenger bus travel'} title={division?.name ?? 'Radhe Travels'} lead={summary} media={heroMedia}>
        <Button href="/contact?type=travel">{division?.cta_label ?? 'Enquire'}</Button>
      </PageHero>
      <CustomSections page="radhe-travels" placement="top" />

      <SectionShell variant="blue">
        <MonoLabel>Routes</MonoLabel>
        <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-5xl">Our routes</h2>
        <RadheRoutes routes={ROUTES.map((r) => ({ ...r, stops: [...r.stops], media: slot(`route_${r.id}`) }))} />
        <p className="mt-6 max-w-2xl text-sm opacity-80">Call or send an enquiry to confirm timings, seats and fares for your date.</p>
      </SectionShell>

      {division?.description ? (
        <SectionShell variant="white">
          <MonoLabel>About</MonoLabel>
          <p className="mt-6 max-w-3xl whitespace-pre-line text-xl leading-relaxed">{division.description}</p>
        </SectionShell>
      ) : null}

      {services.length ? (
        <SectionShell variant="white">
          <MonoLabel>Services</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold md:text-5xl">Travel services</h2>
          <ServiceList services={services} tone="soft" quote={{ text: 'Every journey should feel as comfortable as it is safe.', by: 'Radhe Travels' }} />
        </SectionShell>
      ) : null}

      {fleet.length ? (
        <SectionShell variant="blue">
          <MonoLabel>Fleet</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold md:text-5xl">Our buses</h2>
          <FleetList items={fleet} tone="radhe" />
        </SectionShell>
      ) : null}

      {projects.length ? (
        <SectionShell variant="white">
          <MonoLabel>Gallery</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold md:text-5xl">On the road</h2>
          <ProjectsStrip projects={projects} />
        </SectionShell>
      ) : null}

      {faqs.length ? (
        <SectionShell variant="blue">
          <MonoLabel>FAQ</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold md:text-5xl">Questions</h2>
          <FaqAccordion faqs={faqs} />
        </SectionShell>
      ) : null}

      <CustomSections page="radhe-travels" placement="bottom" />
      <SectionShell variant="navy">
        <DivisionCta type="travel" label={division?.cta_label ?? 'Enquire'} phones={phones} heading="Plan your journey" />
      </SectionShell>
    </div>
  )
}
