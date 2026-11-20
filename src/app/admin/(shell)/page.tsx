import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

type Stats = {
  counts: Record<'images' | 'projects' | 'equipment' | 'services' | 'enquiries', number>
  recent_uploads: { id: string; storage_path: string; alt: string | null; category: string; created_at: string }[]
  recent_enquiries: { id: string; name: string; division: string; status: string; created_at: string }[]
}

const CARDS = [
  ['images', 'Images'],
  ['projects', 'Projects'],
  ['equipment', 'Equipment'],
  ['services', 'Services'],
  ['enquiries', 'Enquiries'],
] as const

const fmt = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(iso))

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createServerClient()
  // One round trip: counts + recent lists via a single SQL function (RLS applies).
  const { data, error } = await supabase.rpc('admin_dashboard_stats')
  if (error || !data) throw new Error('Failed to load dashboard stats')
  const stats = data as Stats

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <h1 className="font-display text-2xl font-semibold text-navy">Dashboard</h1>

      <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {CARDS.map(([key, label]) => (
          <div key={key} className="rounded-lg border border-navy/10 bg-white p-4">
            <dt className="text-sm text-black/70">{label}</dt>
            <dd data-testid={`stat-${key}`} className="mt-1 font-display text-3xl font-semibold text-navy">
              {stats.counts[key]}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="recent-uploads" className="rounded-lg border border-navy/10 bg-white p-4">
          <h2 id="recent-uploads" className="font-display text-lg font-semibold text-navy">Recent uploads</h2>
          {stats.recent_uploads.length === 0 ? (
            <p className="mt-3 text-sm text-black/70">No uploads yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-navy/10">
              {stats.recent_uploads.map((u) => (
                <li key={u.id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{u.alt || u.storage_path}</span>
                  <time dateTime={u.created_at} className="shrink-0 text-black/70">{fmt(u.created_at)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-enquiries" className="rounded-lg border border-navy/10 bg-white p-4">
          <h2 id="recent-enquiries" className="font-display text-lg font-semibold text-navy">Recent enquiries</h2>
          {stats.recent_enquiries.length === 0 ? (
            <p className="mt-3 text-sm text-black/70">No enquiries yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-navy/10">
              {stats.recent_enquiries.map((e) => (
                <li key={e.id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">
                    {e.name} <span className="text-black/70">· {e.division} · {e.status}</span>
                  </span>
                  <time dateTime={e.created_at} className="shrink-0 text-black/70">{fmt(e.created_at)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
