import { CustomSections } from '@/components/site/CustomSections'
import { Button, MonoLabel, PageHero, SectionShell } from '@/components/site'
import { DivisionCta, DivisionFeature, FaqAccordion, FleetList, ProjectsStrip, ServiceList, loadDivisionPage } from '@/components/site/division'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 60
export const generateMetadata = () => buildMetadata('krishna-trailor', { title: 'Krishna Trailor', description: 'Krishna Trailor, the trailer transport division of Krishna Trailor Company, Chandigarh.', path: '/krishna-trailor' })

export default async function KrishnaTrailorPage() {
  const { slot, heroMedia, division, services, fleet, faqs, projects, phones, intro } = await loadDivisionPage('krishna')
  const summary = intro ?? division?.summary ?? undefined
  return (
    <div data-division="krishna">
      <PageHero label={division?.tagline ?? 'Heavy haulage and trailer transport'} title={division?.name ?? 'Krishna Trailor Company'} lead={summary} media={heroMedia}>
        <Button href="/contact?type=industrial">{division?.cta_label ?? 'Get a Quote'}</Button>
        {fleet.length ? <Button href="/fleet" variant="outline">Our Fleet</Button> : null}
      </PageHero>
      <CustomSections page="krishna-trailor" placement="top" />

      {division?.description ? (
        <SectionShell variant="white">
          <MonoLabel>About this division</MonoLabel>
          <p className="mt-6 max-w-3xl whitespace-pre-line text-xl leading-relaxed">{division.description}</p>
        </SectionShell>
      ) : null}

      <SectionShell variant="soft">
        <DivisionFeature
          label="Why Krishna Trailor"
          title="Built for loads that do not fit"
          paragraphs={['Low-bed, semi-bed and hydraulic-axle trailers behind powerful prime movers, run by drivers who know the highway corridors out of Chandigarh.']}
          bullets={['Low-bed and semi-bed trailers', 'Hydraulic axle systems', 'Tractor pullers', 'Machinery and plant moves', 'Industrial and project cargo', 'Chandigarh and Bhopal offices']}
          media={slot('feature')}
        />
      </SectionShell>

      {services.length ? (
        <SectionShell variant="white">
          <MonoLabel>Services</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">What we move</h2>
          <ServiceList services={services} tone="editorial" />
        </SectionShell>
      ) : null}

      {fleet.length ? (
        <SectionShell variant="soft">
          <MonoLabel>Fleet</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">Equipment</h2>
          <FleetList items={fleet} tone="light" />
        </SectionShell>
      ) : null}

      {projects.length ? (
        <SectionShell variant="white">
          <MonoLabel>Projects</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">Recent work</h2>
          <ProjectsStrip projects={projects} />
        </SectionShell>
      ) : null}

      {faqs.length ? (
        <SectionShell variant="white">
          <MonoLabel>FAQ</MonoLabel>
          <h2 className="mb-8 mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">Questions</h2>
          <FaqAccordion faqs={faqs} />
        </SectionShell>
      ) : null}

      <CustomSections page="krishna-trailor" placement="bottom" />
      <SectionShell variant="black">
        <DivisionCta type="industrial" label={division?.cta_label} phones={phones} heading="Get your load moving" />
      </SectionShell>
    </div>
  )
}
