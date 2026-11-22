import { createServerClient } from '@/lib/supabase/server'
import { resolveMediaMap } from '@/lib/queries/media'
import { isVideoMime, isVideoUrl } from '@/lib/validation/media'
import { MediaImage } from './MediaImage'
import { MonoLabel } from './MonoLabel'
import { SectionShell } from './SectionShell'
import { BENTO_GRID, bentoSpan } from './bento'

type Content = { kind?: string; placement?: 'top' | 'bottom'; title?: string; body?: string; media_ids?: string[] }

/**
 * Sections created in Admin > Sections. Layout is automatic: 1 item = wide, 2 = side by side,
 * 3+ = orphan-free grid. `placement="top"` renders after the hero, `"bottom"` before the closing call to action.
 */
export async function CustomSections({ page, placement }: { page: string; placement: 'top' | 'bottom' }) {
  let rows: { id: string; content: Content }[] = []
  let media = new Map<string, import('@/lib/queries/types').MediaRef>()
  try {
    const db = await createServerClient()
    const { data } = await db.from('page_content').select('id, content').eq('page_key', page).eq('published', true).like('block_key', 'sec_%').order('sort_order')
    rows = ((data ?? []) as { id: string; content: Content }[]).filter((r) => (r.content.placement ?? 'bottom') === placement)
    media = await resolveMediaMap(db, rows.flatMap((r) => r.content.media_ids ?? []))
  } catch {
    return null
  }
  if (rows.length === 0) return null
  return (
    <>
      {rows.map((r, idx) => {
        const c = r.content
        const items = (c.media_ids ?? []).map((id) => media.get(id)).filter((m): m is NonNullable<typeof m> => !!m)
        const n = items.length
        const hid = `cs-${r.id}`
        return (
          <SectionShell key={r.id} variant={idx % 2 === 0 ? 'white' : 'soft'} labelledBy={c.title ? hid : undefined}>
            {c.title && (
              <>
                <MonoLabel>Featured</MonoLabel>
                <h2 id={hid} className="mt-3 font-display text-3xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">{c.title}</h2>
              </>
            )}
            {c.body && <p className="mt-4 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-black/80">{c.body}</p>}
            {n > 0 && (
              <ul className={`mt-8 ${n === 1 ? 'grid' : n === 2 ? 'grid gap-4 sm:grid-cols-2' : BENTO_GRID}`}>
                {items.map((m, i) => (
                  <li key={m.url} className={`overflow-hidden rounded-xl bg-black ${n > 2 ? bentoSpan(i, n) : ''}`}>
                    {isVideoMime(m.mime) || isVideoUrl(m.url) ? (
                      <video src={m.url} controls playsInline preload="metadata" aria-label={m.alt ?? c.title ?? 'Video'} className="aspect-video w-full bg-black" />
                    ) : (
                      <MediaImage media={m} aspect={n === 1 ? '16/9' : '4/3'} sizes={n === 1 ? '100vw' : '(min-width:1024px) 50vw, 100vw'} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionShell>
        )
      })}
    </>
  )
}
