import { CustomSections } from '@/components/site/CustomSections'
import { Button, MonoLabel, PageHero, SectionShell } from '@/components/site'
import { DivisionCta, DivisionFeature, FaqAccordion, FleetList, HaulageProcess, ProjectsStrip, ServiceList, loadDivisionPage } from '@/components/site/division'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 60
export const generateMetadata = () => buildMetadata('heavy-haulage', { title: 'Heavy Haulage', description: 'Heavy haulage transport with trailers and hydraulic axle systems from Krishna Trailor Company.', path: '/heavy-haulage' })

export default async function HeavyHaulagePage() {
  const { slot, heroMedia, division, services, fleet, faqs, projects, phones, intro } = await loadDivisionPage('haulage')
  const summary = intro ?? division?.summary ?? undefined
  return (
    <div data-division="haulage">
      <PageHero label="Heavy haulage" title="Heavy Haulage" lead={summary} media={heroMedia} className="!bg-[#0a0a0a]">
        <Button href="/contact?type=industrial">Request a haulage quote</Button>
      </PageHero>
      <CustomSections page="heavy-haulage" placement="top" />

      <SectionShell variant="black" className="!bg-[#0a0a0a]">
        <MonoLabel>Process</MonoLabel>
        <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">How a haul runs</h2>
        <HaulageProcess />
      </SectionShell>

      <SectionShell variant="black" className="!bg-[#0a0a0a]">
        <DivisionFeature
          label="Capability"
          title="Oversized, over-weight, over here"
          paragraphs={['Multi-axle hydraulic trailers for transformers, vessels, machinery and long structural loads, planned from route to delivery.']}
          bullets={['Multi-axle hydraulic trailers', 'Route survey and planning', 'Load securing and lashing', 'Escort and permit coordination', 'Pan-India movement', 'Single point of contact']}
          media={slot('feature')}
          flip
        />
      </SectionShell>

      {services.length ? (
        <SectionShell variant="black" className="!bg-[#0a0a0a]">
          <MonoLabel>Services</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">Haulage services</h2>
          <ServiceList services={services} tone="mono" />
        </SectionShell>
      ) : null}

      {fleet.length ? (
        <SectionShell variant="black" className="!bg-[#0a0a0a]">
          <MonoLabel>Fleet</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">Trailers and pullers</h2>
          <FleetList items={fleet} tone="dark" />
        </SectionShell>
      ) : null}

      {projects.length ? (
        <SectionShell variant="black" className="!bg-[#0a0a0a]">
          <MonoLabel>Projects</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">Recent work</h2>
          <ProjectsStrip projects={projects} />
        </SectionShell>
      ) : null}

      {faqs.length ? (
        <SectionShell variant="black" className="!bg-[#0a0a0a]">
          <MonoLabel>FAQ</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">Questions</h2>
          <FaqAccordion faqs={faqs} />
        </SectionShell>
      ) : null}

      <CustomSections page="heavy-haulage" placement="bottom" />
      <SectionShell variant="black" className="!bg-[#0a0a0a] border-t border-white/15">
        <DivisionCta type="industrial" label="Request a haulage quote" phones={phones} heading="Plan your haul" />
      </SectionShell>
    </div>
  )
}
