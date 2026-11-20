import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { ENQUIRY_STATUSES, PAGE_SIZE, STATUS_LABEL, isEnquiryStatus, sanitizeSearch } from '@/lib/admin/enquiries'
import { StatusBadge } from './StatusBadge'

type SP = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''
const fmt = (iso: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(iso))
const field = 'rounded border border-navy/30 bg-white px-3 py-2 text-sm'

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin()
  const sp = await searchParams
  const q = sanitizeSearch(one(sp.q))
  const status = one(sp.status)
  const type = one(sp.type)
  const page = Math.max(1, Math.min(10000, parseInt(one(sp.page), 10) || 1))

  const db = await createServerClient()
  let query = db
    .from('enquiries')
    .select('id, name, phone, email, company, enquiry_type, division, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  if (isEnquiryStatus(status)) query = query.eq('status', status)
  if (type === 'industrial' || type === 'travel') query = query.eq('enquiry_type', type)
  if (q) {
    const p = `%${q}%`
    query = query.or(['name', 'phone', 'email', 'company', 'message'].map((c) => `${c}.ilike.${p}`).join(','))
  }
  const { data, count, error } = await query
  if (error) throw new Error('Failed to load enquiries')
  const rows = data ?? []
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const href = (p: number) => {
    const u = new URLSearchParams()
    if (q) u.set('q', q)
    if (isEnquiryStatus(status)) u.set('status', status)
    if (type === 'industrial' || type === 'travel') u.set('type', type)
    if (p > 1) u.set('page', String(p))
    const s = u.toString()
    return `/admin/enquiries${s ? `?${s}` : ''}`
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Enquiries</h1>
      <form method="get" role="search" className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="q" className="block text-sm font-medium">Search enquiries</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, phone, email, company, message" className={`${field} w-72`} />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium">Status</label>
          <select id="status" name="status" defaultValue={isEnquiryStatus(status) ? status : ''} className={field}>
            <option value="">All</option>
            {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium">Type</label>
          <select id="type" name="type" defaultValue={type === 'industrial' || type === 'travel' ? type : ''} className={field}>
            <option value="">All</option>
            <option value="industrial">Industrial</option>
            <option value="travel">Travel</option>
          </select>
        </div>
        <button type="submit" className="rounded bg-orange px-4 py-2 text-sm font-medium text-black hover:opacity-90 focus-visible:outline-2 focus-visible:outline-navy">Apply</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Enquiries, newest first</caption>
          <thead className="border-b border-navy/10 bg-soft text-black/80">
            <tr>
              {['Name', 'Contact', 'Company', 'Type', 'Status', 'Received'].map((h) => <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>)}
              <th scope="col" className="px-3 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="px-3 py-2 font-medium">{r.name}</th>
                <td className="px-3 py-2">{[r.phone, r.email].filter(Boolean).join(' / ')}</td>
                <td className="px-3 py-2">{r.company ?? ''}</td>
                <td className="px-3 py-2 capitalize">{r.enquiry_type ?? ''}</td>
                <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-2 whitespace-nowrap">{fmt(r.created_at)}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/enquiries/${r.id}`} aria-label={`View ${r.name}`} className="rounded border border-navy/20 px-2.5 py-1 text-sm font-medium text-navy hover:bg-soft focus-visible:outline-2 focus-visible:outline-orange">View</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-black/70">No enquiries found.</td></tr>}
          </tbody>
        </table>
      </div>

      <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
        <span>{count ?? 0} total &middot; page {page} of {pages}</span>
        <span className="flex gap-2">
          {page > 1 && <Link href={href(page - 1)} className="rounded border border-navy/20 px-3 py-1 hover:bg-soft">Previous</Link>}
          {page < pages && <Link href={href(page + 1)} className="rounded border border-navy/20 px-3 py-1 hover:bg-soft">Next</Link>}
        </span>
      </nav>
    </main>
  )
}
