import { requireAdmin } from '@/lib/auth'
import { saveClient } from '../actions'
import { ClientForm } from '../ClientForm'
import { clientFields } from '../schema'

export default async function NewClientPage() {
  await requireAdmin()
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New client</h1>
      <ClientForm fields={clientFields()} action={saveClient.bind(null, null)} />
    </main>
  )
}
