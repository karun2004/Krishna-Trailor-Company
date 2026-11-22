import { MediaImage, MonoLabel, PageHero, SectionShell } from '@/components/site'
import { ClientLogosStrip } from '@/components/site/pages/ClientLogosStrip'
import { CtaBlock } from '@/components/site/pages/CtaBlock'
import { ProjectsExplorer } from '@/components/site/pages/ProjectsExplorer'
import { getDivision, getGalleryAlbums, getProjects } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { CustomSections } from '@/components/site/CustomSections'
import { getSlots } from '@/lib/queries/slots'
import { BENTO_GRID, bentoSpan } from '@/components/site/bento'
import { isVideoMime, isVideoUrl } from '@/lib/validation/media'

export const dynamic = 'force-dynamic'
export const generateMetadata = () => buildMetadata('projects', { title: 'Projects', description: 'Selected projects delivered by Krishna Trailor Company.', path: '/projects' })

const DIVISION_SLUGS = ['krishna-trailor', 'heavy-machinery', 'radhe-travels']

export default async function ProjectsPage() {
  const slot = await getSlots('projects')
  const [projects, albums, divs] = await Promise.all([
    getProjects(),
    getGalleryAlbums(),
    Promise.all(DIVISION_SLUGS.map((s) => getDivision(s))),
  ])
  const used = new Set(projects.map((p) => p.division_id))
  const divisions = divs.filter((d): d is NonNullable<typeof d> => !!d && used.has(d.id)).map((d) => ({ id: d.id, name: d.name }))
  const filledAlbums = albums.filter((a) => a.items.some((i) => i.media))
  // Two fixed sub-sections, managed in admin: Gallery albums "project-videos" and "project-images".
  const itemsOf = (slug: string) => (albums.find((a) => a.slug === slug)?.items ?? []).filter((i) => i.media)
  const videos = itemsOf('project-videos').filter((i) => isVideoMime(i.media?.mime) || isVideoUrl(i.media?.url))
  const photos = itemsOf('project-images').filter((i) => !(isVideoMime(i.media?.mime) || isVideoUrl(i.media?.url)))
  const otherAlbums = filledAlbums.filter((a) => a.slug !== 'project-videos' && a.slug !== 'project-images')

  return (
    <>
      <PageHero label="Projects" title="Projects" media={slot('hero')} lead="Selected loads and jobs delivered by Krishna Trailor Company." />

      <CustomSections page="projects" placement="top" />
      {projects.length === 0 ? (
        <CtaBlock label="Projects" title="Project showcase coming soon" body="We are putting together our project gallery. To discuss a requirement or ask about past work, get in touch." />
      ) : (
        <SectionShell variant="white" labelledBy="projects-h">
          <h2 id="projects-h" className="sr-only">Project list</h2>
          <ProjectsExplorer projects={projects} divisions={divisions} />
        </SectionShell>
      )}

      <SectionShell variant="black" labelledBy="videos-h">
        <MonoLabel>Videos</MonoLabel>
        <h2 id="videos-h" className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl">Project videos</h2>
        {videos.length > 0 ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {videos.map((v) => (
              <li key={v.id} className="overflow-hidden rounded-xl bg-white/5 sm:last:odd:col-span-2">
                <video src={v.media!.url} controls playsInline preload="metadata" aria-label={v.caption ?? 'Project video'} className="aspect-video w-full bg-black" />
                {v.caption && <p className="p-4 text-sm text-white/80">{v.caption}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-xl text-white/70">Video clips from our jobs are coming soon.</p>
        )}
      </SectionShell>

      <SectionShell variant="white" labelledBy="photos-h">
        <MonoLabel>Photos</MonoLabel>
        <h2 id="photos-h" className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl">Project images</h2>
        {photos.length > 0 ? (
          <ul className={`mt-8 ${BENTO_GRID}`}>
            {photos.map((p, i) => (
              <li key={p.id} className={`overflow-hidden rounded-xl bg-soft ${bentoSpan(i, photos.length)}`}>
                <MediaImage media={p.media} alt={p.caption ?? undefined} aspect="4/3" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
                {p.caption && <p className="p-3 text-sm text-black/70">{p.caption}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-xl text-black/70">Photos from our jobs are coming soon.</p>
        )}
      </SectionShell>

      {otherAlbums.length > 0 && (
        <SectionShell variant="soft" labelledBy="gallery-h">
          <MonoLabel>Gallery</MonoLabel>
          <h2 id="gallery-h" className="mt-4 font-display text-3xl font-semibold uppercase tracking-tight md:text-5xl">Gallery</h2>
          {otherAlbums.map((a) => (
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

      <CustomSections page="projects" placement="bottom" />
      <ClientLogosStrip />
      {projects.length > 0 && <CtaBlock label="Enquire" title="Have a project in mind?" body="Contact us to discuss your requirement." variant="black" />}
    </>
  )
}
