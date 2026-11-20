import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { saveTestimonial } from '../actions'
import { TestimonialForm } from '../TestimonialForm'
import { testimonialFields } from '../schema'

export default async function NewTestimonialPage() {
  await requireAdmin()
  const db = await createServerClient()
  const { data: divisions } = await db.from('business_divisions').select('id, name').order('sort_order')
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New testimonial</h1>
      <TestimonialForm fields={testimonialFields(divisions ?? [])} action={saveTestimonial.bind(null, null)} />
    </main>
  )
}
