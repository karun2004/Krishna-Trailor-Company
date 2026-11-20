import { requireAdmin } from '@/lib/auth'
import { saveSeo } from '../actions'
import { SeoForm } from '../SeoForm'
import { seoFields } from '../schema'

export default async function NewSeoPage() {
  await requireAdmin()
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New page entry</h1>
      <SeoForm fields={seoFields} action={saveSeo.bind(null, null)} />
    </main>
  )
}
