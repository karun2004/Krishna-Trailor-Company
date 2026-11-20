import { notFound } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { saveBlock } from '../actions'
import { BlockForm } from '../BlockForm'
import { blockFields } from '../schema'

export default async function EditBlockPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const db = await createServerClient()
  const { data: row } = await db.from('page_content').select('*').eq('id', id).eq('page_key', 'home').maybeSingle()
  if (!row) notFound()
  const initial = { ...row, content: JSON.stringify(row.content ?? {}, null, 2) }
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">Edit homepage block</h1>
      <p className="mb-6 font-mono text-sm text-black/70">{row.page_key} / {row.block_key}</p>
      <BlockForm fields={blockFields} initial={initial} action={saveBlock.bind(null, id)} />
    </main>
  )
}
