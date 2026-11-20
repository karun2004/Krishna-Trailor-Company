import { notFound } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { saveFAQ } from '../actions'
import { FAQForm } from '../FAQForm'
import { fAQFields } from '../schema'

export default async function EditFAQPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const db = await createServerClient()
  const [{ data: row }, { data: divisions }] = await Promise.all([
    db.from('faqs').select('*').eq('id', id).maybeSingle(),
    db.from('business_divisions').select('id, name').order('sort_order'),
  ])
  if (!row) notFound()
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Edit FAQ</h1>
      <FAQForm fields={fAQFields(divisions ?? [])} initial={row} action={saveFAQ.bind(null, id)} />
    </main>
  )
}
