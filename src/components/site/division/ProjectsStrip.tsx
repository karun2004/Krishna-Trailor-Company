import { RevealGroup } from '../anim'
import { MediaImage } from '@/components/site'
import { BENTO_GRID, bentoSpan } from '../bento'
import type { ProjectWithImages } from '@/lib/queries/types'

export function ProjectsStrip({ projects }: { projects: ProjectWithImages[] }) {
  return (
    <RevealGroup as="ul" className={BENTO_GRID}>
      {projects.slice(0, 6).map((p, i, arr) => (
        <li key={p.id} className={`${bentoSpan(i, arr.length)} overflow-hidden rounded-xl bg-[var(--tint,#f5f6f7)]`}>
          <div className="aspect-[4/3] w-full overflow-hidden">
            <MediaImage media={p.media ?? p.images[0]?.media ?? null} aspect="4/3" sizes="(min-width:1024px) 33vw, 100vw" />
          </div>
          <div className="p-4">
            <h3 className="font-display text-lg font-bold uppercase">{p.title}</h3>
            {p.location ? <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-60">{p.location}</p> : null}
          </div>
        </li>
      ))}
    </RevealGroup>
  )
}
