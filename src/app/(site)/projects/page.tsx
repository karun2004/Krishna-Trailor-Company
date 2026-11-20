import { GhostHeadline, MediaImage, MonoLabel, SectionShell } from '@/components/site'
import { ClientLogosStrip } from '@/components/site/pages/ClientLogosStrip'
import { CtaBlock } from '@/components/site/pages/CtaBlock'
import { ProjectsExplorer } from '@/components/site/pages/ProjectsExplorer'
import { pageMetadata } from '@/components/site/pages/seo'
import { getDivision, getGalleryAlbums, getProjects } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const generateMetadata = () => pageMetadata('projects', 'Projects')

const DIVISION_SLUGS = ['krishna-trailor', 'heavy-machinery', 'radhe-travels']

export default async function ProjectsPage() {
  const [projects, albums, divs] = await Promise.all([
    getProjects(),
    getGalleryAlbums(),
    Promise.all(DIVISION_SLUGS.map((s) => getDivision(s))),
  ])
  const used = new Set(projects.map((p) => p.division_id))
  const divisions = divs.filter((d): d is NonNullable<typeof d> => !!d && used.has(d.id)).map((d) => ({ id: d.id, name: d.name }))
  const filledAlbums = albums.filter((a) => a.items.some((i) => i.media))

  return (
    <>
      <SectionShell variant="black">
        <MonoLabel index={1}>Projects</MonoLabel>
        <GhostHeadline as="h1" on="dark" className="mt-6">Projects</GhostHeadline>
      </SectionShell>

      {projects.length === 0 ? (
        <CtaBlock label="Projects" title="Project showcase coming soon" body="We are putting together our project gallery. To discuss a requirement or ask about past work, get in touch." />
      ) : (
        <SectionShell variant="white" labelledBy="projects-h">
          <h2 id="projects-h" className="sr-only">Project list</h2>
          <ProjectsExplorer projects={projects} divisions={divisions} />
        </SectionShell>
      )}

      {filledAlbums.length > 0 && (
        <SectionShell variant="soft" labelledBy="gallery-h">
          <MonoLabel index={2}>Gallery</MonoLabel>
          <h2 id="gallery-h" className="mt-4 font-display text-3xl font-semibold uppercase tracking-tight md:text-5xl">Gallery</h2>
          {filledAlbums.map((a) => (
            <div key={a.id} className="mt-10">
              <h3 className="font-display text-xl font-semibold uppercase">{a.title}</h3>
              {a.description && <p className="mt-1 max-w-2xl text-black/70">{a.description}</p>}
              <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {a.items.filter((i) => i.media).map((i) => (
                  <li key={i.id}><MediaImage media={i.media} alt={i.caption ?? undefined} aspect="1/1" sizes="(min-width:768px) 25vw, 50vw" className="rounded-xl" /></li>
                ))}
              </ul>
            </div>
          ))}
        </SectionShell>
      )}

      <ClientLogosStrip />
      {projects.length > 0 && <CtaBlock label="Enquire" title="Have a project in mind?" body="Contact us to discuss your requirement." variant="black" />}
    </>
  )
}
