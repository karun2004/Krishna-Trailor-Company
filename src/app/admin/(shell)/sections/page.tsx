import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { SECTION_PAGES } from '@/lib/admin/section-pages'
import { SectionEditor, type SectionRow } from './SectionEditor'

export default async function SectionsPage() {
  await requireAdmin()
  const db = await createServerClient()
  const { data, error } = await db.from('page_content').select('id, page_key, content, published').like('block_key', 'sec_%').order('page_key').order('sort_order')
  if (error) throw new Error('Failed to load sections')
  const rows: SectionRow[] = (data ?? []).map((r) => {
    const c = (r.content ?? {}) as Record<string, unknown>
    return {
      id: r.id as string, page: r.page_key as string, published: r.published as boolean,
      placement: c.placement === 'top' ? 'top' : 'bottom', title: String(c.title ?? ''), body: String(c.body ?? ''),
      mediaIds: Array.isArray(c.media_ids) ? (c.media_ids as string[]) : [],
    }
  })
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-black/60">Website</p>
      <h1 className="mb-2 mt-1 font-display text-3xl font-extrabold uppercase tracking-tight">Sections</h1>
      <p className="mb-8 max-w-2xl text-sm text-black/70">
        Add a new block to any page: a title, some text, and any mix of photos and videos. Layout adjusts itself to the number of items.
        Choose whether it sits right after the page header or just above the closing call to action.
      </p>
      <SectionEditor pages={[...SECTION_PAGES]} rows={rows} />
    </main>
  )
}
