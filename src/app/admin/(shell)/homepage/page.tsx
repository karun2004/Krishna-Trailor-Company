import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { BlocksList } from './BlocksList'

export default async function HomepagePage() {
  await requireAdmin()
  const db = await createServerClient()
  const { data, error } = await db
    .from('page_content')
    .select('id, block_key, content, published, updated_at')
    .eq('page_key', 'home')
    .order('sort_order')
    .order('created_at')
  if (error) throw new Error('Failed to load homepage blocks')
  const rows = (data ?? []).map((r) => ({
    id: r.id as string,
    block_key: r.block_key as string,
    preview: Object.values((r.content ?? {}) as Record<string, unknown>).filter((v) => typeof v === 'string').join(' · ').slice(0, 120),
    published: r.published as boolean,
    updated_at: r.updated_at as string,
  }))
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <h1 className="mb-2 font-display text-2xl font-semibold text-navy">Homepage</h1>
      <p className="mb-6 text-sm text-black/70">Edit the copy blocks shown on the homepage. Use the switch to publish or hide a block.</p>
      <BlocksList rows={rows} />
    </main>
  )
}
