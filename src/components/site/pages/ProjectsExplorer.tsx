'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card } from '@/components/site/Card'
import { MediaImage } from '@/components/site/MediaImage'
import type { MediaRef, ProjectWithImages } from '@/lib/queries/types'

type Phase = 'before' | 'during' | 'after'
type Shot = { media: MediaRef | null; caption: string | null }
export type DivisionOption = { id: string; name: string }

const PHASES: Phase[] = ['before', 'during', 'after']

function shotsFor(p: ProjectWithImages, phase: Phase | null): Shot[] {
  if (phase) return p.images.filter((i) => i.phase === phase && i.media).map((i) => ({ media: i.media, caption: i.caption }))
  return p.media ? [{ media: p.media, caption: null }] : []
}
const phasesOf = (p: ProjectWithImages) => PHASES.filter((ph) => p.images.some((i) => i.phase === ph && i.media))
const hasMedia = (p: ProjectWithImages) => !!p.media || phasesOf(p).length > 0

export function ProjectsExplorer({ projects, divisions }: { projects: ProjectWithImages[]; divisions: DivisionOption[] }) {
  const [division, setDivision] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const returnRef = useRef<HTMLElement | null>(null)
  const shown = division === 'all' ? projects : projects.filter((p) => p.division_id === division)
  const open = projects.find((p) => p.id === openId) ?? null

  const close = useCallback(() => {
    setOpenId(null)
    requestAnimationFrame(() => returnRef.current?.focus())
  }, [])

  return (
    <>
      {divisions.length > 1 && (
        <div role="group" aria-label="Filter projects by division" className="mb-8 flex flex-wrap gap-2">
          {[{ id: 'all', name: 'All' }, ...divisions].map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={division === d.id}
              onClick={() => setDivision(d.id)}
              className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${division === d.id ? 'border-black bg-black text-white' : 'border-black/20 bg-white text-black'}`}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => {
          const body = (
            <>
              <MediaImage media={p.media ?? p.images.find((i) => i.media)?.media ?? null} aspect="4/3" sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" />
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold uppercase tracking-tight">{p.title}</h3>
                {p.location && <p className="mt-1 font-mono text-xs uppercase tracking-wider text-black/70">{p.location}</p>}
                {p.description && <p className="mt-3 line-clamp-3 text-sm text-black/70">{p.description}</p>}
              </div>
            </>
          )
          return (
            <Card key={p.id} as="li" padded={false} className="flex flex-col">
              {hasMedia(p) ? (
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`View ${p.title}`}
                  onClick={(e) => { returnRef.current = e.currentTarget; setOpenId(p.id) }}
                  className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                >
                  {body}
                </button>
              ) : body}
            </Card>
          )
        })}
      </ul>
      {open && <Lightbox project={open} onClose={close} />}
    </>
  )
}

function Lightbox({ project, onClose }: { project: ProjectWithImages; onClose: () => void }) {
  const phases = phasesOf(project)
  const [phase, setPhase] = useState<Phase | null>(phases[0] ?? null)
  const [idx, setIdx] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const shots = shotsFor(project, phase)
  const shot = shots[Math.min(idx, shots.length - 1)]

  const step = useCallback((d: number) => { if (shots.length) setIdx((i) => (i + d + shots.length) % shots.length) }, [shots.length])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('button[data-close]')?.focus()
    return () => { document.body.style.overflow = prev }
  }, [])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    else if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'Tab') {
      const f = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [])
      if (f.length === 0) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onKeyDown={onKeyDown}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={project.title} className="flex max-h-full w-full max-w-5xl flex-col gap-4 overflow-auto text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold uppercase tracking-tight md:text-2xl">{project.title}</h2>
            {project.location && <p className="font-mono text-xs uppercase tracking-wider text-white/60">{project.location}</p>}
          </div>
          <button data-close type="button" onClick={onClose} className="rounded-full border border-white/40 px-4 py-2 font-mono text-xs uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Close</button>
        </div>
        {phases.length > 0 && (
          <div role="tablist" aria-label="Project phase" className="flex gap-2">
            {phases.map((ph) => (
              <button
                key={ph}
                role="tab"
                type="button"
                aria-selected={phase === ph}
                onClick={() => { setPhase(ph); setIdx(0) }}
                className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${phase === ph ? 'border-white bg-white text-black' : 'border-white/40'}`}
              >
                {ph}
              </button>
            ))}
          </div>
        )}
        <div role="tabpanel" aria-label={phase ? `${phase} photos` : 'Photo'}>
          {shot && <MediaImage media={shot.media} aspect="16/10" sizes="(min-width:1024px) 960px, 100vw" imgClassName="object-contain" className="bg-black" />}
          {shot?.caption && <p className="mt-2 text-sm text-white/70">{shot.caption}</p>}
        </div>
        {shots.length > 1 && (
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => step(-1)} className="rounded-full border border-white/40 px-4 py-2 font-mono text-xs uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Previous</button>
            <span className="font-mono text-xs text-white/60" aria-live="polite">{Math.min(idx, shots.length - 1) + 1} / {shots.length}</span>
            <button type="button" onClick={() => step(1)} className="rounded-full border border-white/40 px-4 py-2 font-mono text-xs uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Next</button>
          </div>
        )}
        {project.description && <p className="text-sm text-white/70">{project.description}</p>}
      </div>
    </div>
  )
}
