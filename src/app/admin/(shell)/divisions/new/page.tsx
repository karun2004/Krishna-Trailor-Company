import { requireAdmin } from '@/lib/auth'
import { saveDivision } from '../actions'
import { DivisionForm } from '../DivisionForm'
import { divisionFields } from '../schema'

export default async function NewDivisionPage() {
  await requireAdmin()
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New division</h1>
      <DivisionForm fields={divisionFields()} action={saveDivision.bind(null, null)} />
    </main>
  )
}
