import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { ServicesList } from './ServicesList'

export default async function ServicesPage() {
  await requireAdmin()
  const db = await createServerClient()
  const { data, error } = await db
    .from('services')
    .select('id, name, slug, category, featured, published, updated_at')
    .order('sort_order')
    .order('created_at')
  if (error) throw new Error('Failed to load services')
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-navy">Services</h1>
        <Link href="/admin/services/new" className="rounded bg-orange px-4 py-2 text-sm font-medium text-black hover:opacity-90 focus-visible:outline-2 focus-visible:outline-navy">
          New service
        </Link>
      </div>
      <ServicesList rows={data ?? []} />
    </main>
  )
}
