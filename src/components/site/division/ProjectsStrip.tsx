import { RevealGroup } from '../anim'
import { MediaImage } from '@/components/site'
import type { ProjectWithImages } from '@/lib/queries/types'

export function ProjectsStrip({ projects }: { projects: ProjectWithImages[] }) {
  return (
    <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.slice(0, 6).map((p) => (
        <li key={p.id}>
          <MediaImage media={p.media ?? p.images[0]?.media ?? null} aspect="4/3" sizes="(min-width:1024px) 33vw, 100vw" />
          <h3 className="mt-3 font-display text-lg font-bold uppercase">{p.title}</h3>
          {p.location ? <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-60">{p.location}</p> : null}
        </li>
      ))}
    </RevealGroup>
  )
}
