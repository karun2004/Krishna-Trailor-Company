import { Button, MediaImage, MonoLabel, SectionShell } from '@/components/site'
import { DivisionCta, FaqAccordion, FleetList, ProjectsStrip, ServiceList, divisionMetadata, loadDivisionPage } from '@/components/site/division'

export const revalidate = 60
export const generateMetadata = () => divisionMetadata('radhe')

export default async function RadheTravelsPage() {
  const { division, services, fleet, faqs, projects, phones, intro } = await loadDivisionPage('radhe')
  const summary = intro ?? division?.summary ?? undefined
  return (
    <div data-division="radhe">
      <SectionShell variant="blue">
        <div className={division?.media ? 'grid items-center gap-10 lg:grid-cols-2' : ''}>
          <div>
            <MonoLabel index={1}>{division?.tagline ?? 'Passenger bus travel'}</MonoLabel>
            <h1 className="mt-6 break-words font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">{division?.name ?? 'Radhe Travels'}</h1>
            {summary ? <p className="mt-6 max-w-xl text-lg opacity-80">{summary}</p> : null}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/contact?type=travel">{division?.cta_label ?? 'Enquire'}</Button>
            </div>
          </div>
          {division?.media ? <MediaImage media={division.media} aspect="4/3" priority className="overflow-hidden rounded-3xl" sizes="(min-width:1024px) 50vw, 100vw" /> : null}
        </div>
      </SectionShell>

      {division?.description ? (
        <SectionShell variant="white">
          <MonoLabel index={2}>About</MonoLabel>
          <p className="mt-6 max-w-3xl whitespace-pre-line text-xl leading-relaxed">{division.description}</p>
        </SectionShell>
      ) : null}

      {services.length ? (
        <SectionShell variant="white">
          <MonoLabel index={3}>Services</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold md:text-5xl">Travel services</h2>
          <ServiceList services={services} tone="soft" />
        </SectionShell>
      ) : null}

      {fleet.length ? (
        <SectionShell variant="blue">
          <MonoLabel index={4}>Fleet</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold md:text-5xl">Our buses</h2>
          <FleetList items={fleet} tone="radhe" />
        </SectionShell>
      ) : null}

      {projects.length ? (
        <SectionShell variant="white">
          <MonoLabel index={5}>Gallery</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold md:text-5xl">On the road</h2>
          <ProjectsStrip projects={projects} />
        </SectionShell>
      ) : null}

      {faqs.length ? (
        <SectionShell variant="blue">
          <MonoLabel index={6}>FAQ</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold md:text-5xl">Questions</h2>
          <FaqAccordion faqs={faqs} />
        </SectionShell>
      ) : null}

      <SectionShell variant="navy">
        <DivisionCta type="travel" label={division?.cta_label ?? 'Enquire'} phones={phones} heading="Plan your journey" />
      </SectionShell>
    </div>
  )
}
