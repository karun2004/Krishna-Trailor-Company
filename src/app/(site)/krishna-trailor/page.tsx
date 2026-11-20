import { Button, GhostHeadline, MediaImage, MonoLabel, SectionShell } from '@/components/site'
import { DivisionCta, FaqAccordion, FleetList, ProjectsStrip, ServiceList, loadDivisionPage } from '@/components/site/division'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 60
export const generateMetadata = () => buildMetadata('krishna-trailor', { title: 'Krishna Trailor', description: 'Krishna Trailor, the trailer transport division of Krishna Trailor Company, Chandigarh.', path: '/krishna-trailor' })

export default async function KrishnaTrailorPage() {
  const { division, services, fleet, faqs, projects, phones, intro } = await loadDivisionPage('krishna')
  const summary = intro ?? division?.summary ?? undefined
  return (
    <div data-division="krishna">
      <SectionShell variant="black">
        <div className={division?.media ? 'grid items-center gap-10 lg:grid-cols-2' : ''}>
          <div>
            <MonoLabel index={1}>{division?.tagline ?? 'Heavy haulage and trailer transport'}</MonoLabel>
            <GhostHeadline as="h1" on="dark" className="mt-6 break-words">{division?.name ?? 'Krishna Trailor Company'}</GhostHeadline>
            {summary ? <p className="mt-8 max-w-xl text-lg text-white/80">{summary}</p> : null}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/contact?type=industrial">{division?.cta_label ?? 'Get a Quote'}</Button>
              {fleet.length ? <Button href="/fleet" variant="outline">Our Fleet</Button> : null}
            </div>
          </div>
          {division?.media ? <MediaImage media={division.media} aspect="4/3" priority sizes="(min-width:1024px) 50vw, 100vw" /> : null}
        </div>
      </SectionShell>

      {division?.description ? (
        <SectionShell variant="white">
          <MonoLabel index={2}>About this division</MonoLabel>
          <p className="mt-6 max-w-3xl whitespace-pre-line text-xl leading-relaxed">{division.description}</p>
        </SectionShell>
      ) : null}

      {services.length ? (
        <SectionShell variant="white">
          <MonoLabel index={3}>Services</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">What we move</h2>
          <ServiceList services={services} tone="editorial" />
        </SectionShell>
      ) : null}

      {fleet.length ? (
        <SectionShell variant="soft">
          <MonoLabel index={4}>Fleet</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">Equipment</h2>
          <FleetList items={fleet} tone="light" />
        </SectionShell>
      ) : null}

      {projects.length ? (
        <SectionShell variant="white">
          <MonoLabel index={5}>Projects</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">Recent work</h2>
          <ProjectsStrip projects={projects} />
        </SectionShell>
      ) : null}

      {faqs.length ? (
        <SectionShell variant="white">
          <MonoLabel index={6}>FAQ</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">Questions</h2>
          <FaqAccordion faqs={faqs} />
        </SectionShell>
      ) : null}

      <SectionShell variant="black">
        <DivisionCta type="industrial" label={division?.cta_label} phones={phones} heading="Get your load moving" />
      </SectionShell>
    </div>
  )
}
