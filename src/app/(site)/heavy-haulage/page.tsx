import { Button, GhostHeadline, MediaImage, MonoLabel, SectionShell } from '@/components/site'
import { DivisionCta, FaqAccordion, FleetList, HaulageProcess, ProjectsStrip, ServiceList, divisionMetadata, loadDivisionPage } from '@/components/site/division'

export const revalidate = 60
export const generateMetadata = () => divisionMetadata('haulage')

export default async function HeavyHaulagePage() {
  const { division, services, fleet, faqs, projects, phones, intro } = await loadDivisionPage('haulage')
  const summary = intro ?? division?.summary ?? undefined
  return (
    <div data-division="haulage">
      <SectionShell variant="black" className="!bg-[#0a0a0a]">
        <div className={division?.media ? 'grid items-center gap-10 lg:grid-cols-2' : ''}>
          <div>
            <MonoLabel index="HVY-00">Heavy haulage</MonoLabel>
            <GhostHeadline as="h1" on="dark" className="mt-6 break-words">Heavy Haulage</GhostHeadline>
            {summary ? <p className="mt-8 max-w-xl font-mono text-sm leading-relaxed text-white/75">{summary}</p> : null}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/contact?type=industrial">Request a haulage quote</Button>
            </div>
          </div>
          {division?.media ? <MediaImage media={division.media} aspect="21/9" priority sizes="(min-width:1024px) 50vw, 100vw" /> : null}
        </div>
      </SectionShell>

      <SectionShell variant="black" className="!bg-[#0a0a0a]">
        <MonoLabel index="HVY-01">Process</MonoLabel>
        <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">How a haul runs</h2>
        <HaulageProcess />
      </SectionShell>

      {services.length ? (
        <SectionShell variant="black" className="!bg-[#0a0a0a]">
          <MonoLabel index="HVY-02">Services</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">Haulage services</h2>
          <ServiceList services={services} tone="mono" />
        </SectionShell>
      ) : null}

      {fleet.length ? (
        <SectionShell variant="black" className="!bg-[#0a0a0a]">
          <MonoLabel index="HVY-03">Fleet</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">Trailers and pullers</h2>
          <FleetList items={fleet} tone="dark" />
        </SectionShell>
      ) : null}

      {projects.length ? (
        <SectionShell variant="black" className="!bg-[#0a0a0a]">
          <MonoLabel index="HVY-04">Projects</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">Recent work</h2>
          <ProjectsStrip projects={projects} />
        </SectionShell>
      ) : null}

      {faqs.length ? (
        <SectionShell variant="black" className="!bg-[#0a0a0a]">
          <MonoLabel index="HVY-05">FAQ</MonoLabel>
          <h2 className="mb-10 mt-4 font-display text-4xl font-extrabold uppercase md:text-6xl">Questions</h2>
          <FaqAccordion faqs={faqs} />
        </SectionShell>
      ) : null}

      <SectionShell variant="black" className="!bg-[#0a0a0a] border-t border-white/15">
        <DivisionCta type="industrial" label="Request a haulage quote" phones={phones} heading="Plan your haul" />
      </SectionShell>
    </div>
  )
}
