import { requireAdmin } from '@/lib/auth'
import { saveMilestone } from '../actions'
import { MilestoneForm } from '../MilestoneForm'
import { milestoneFields } from '../schema'

export default async function NewMilestonePage() {
  await requireAdmin()
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New milestone</h1>
      <MilestoneForm fields={milestoneFields()} action={saveMilestone.bind(null, null)} />
    </main>
  )
}
