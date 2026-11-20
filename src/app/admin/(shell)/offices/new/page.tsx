import { requireAdmin } from '@/lib/auth'
import { saveOffice } from '../actions'
import { OfficeForm } from '../OfficeForm'
import { officeFields } from '../schema'

export default async function NewOfficePage() {
  await requireAdmin()
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New office</h1>
      <OfficeForm fields={officeFields} action={saveOffice.bind(null, null)} />
    </main>
  )
}
