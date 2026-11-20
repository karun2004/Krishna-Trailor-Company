import { notFound } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { saveMilestone } from '../actions'
import { MilestoneForm } from '../MilestoneForm'
import { milestoneFields } from '../schema'

export default async function EditMilestonePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const db = await createServerClient()
  const { data: row } = await db.from('timeline_milestones').select('*').eq('id', id).maybeSingle()
  if (!row) notFound()
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Edit milestone</h1>
      <MilestoneForm fields={milestoneFields()} initial={row} action={saveMilestone.bind(null, id)} />
    </main>
  )
}
