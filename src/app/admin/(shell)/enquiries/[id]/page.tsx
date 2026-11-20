import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { StatusBadge } from '../StatusBadge'
import { EnquiryControls } from '../EnquiryControls'

const SIGNED_URL_TTL_SECONDS = 60
const fmt = (iso: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(iso))

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const db = await createServerClient()
  const { data: e } = await db.from('enquiries').select('*').eq('id', id).maybeSingle()
  if (!e) notFound()

  let attachmentUrl: string | null = null
  if (e.attachment_path) {
    const { data } = await db.storage.from('enquiry-attachments').createSignedUrl(e.attachment_path, SIGNED_URL_TTL_SECONDS)
    attachmentUrl = data?.signedUrl ?? null
  }

  const details = Object.entries((e.details ?? {}) as Record<string, unknown>)
  const rows: [string, string | null][] = [
    ['Name', e.name], ['Phone', e.phone], ['Email', e.email], ['Company', e.company],
    ['Division', e.division], ['Type', e.enquiry_type],
    ['Received', fmt(e.created_at)], ['Updated', fmt(e.updated_at)],
  ]

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <Link href="/admin/enquiries" className="text-sm text-navy underline">&larr; All enquiries</Link>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-semibold text-navy">Enquiry from {e.name}</h1>
        <StatusBadge status={e.status} />
      </div>

      <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 rounded-lg border border-navy/10 bg-white p-4 text-sm">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="contents"><dt className="font-semibold">{k}</dt><dd className="break-words">{v}</dd></div>
        ))}
        {details.map(([k, v]) => (
          <div key={`d-${k}`} className="contents"><dt className="font-semibold">{k}</dt><dd className="break-words">{String(v)}</dd></div>
        ))}
        {e.message && <div className="contents"><dt className="font-semibold">Message</dt><dd className="whitespace-pre-wrap break-words">{e.message}</dd></div>}
        <div className="contents">
          <dt className="font-semibold">Attachment</dt>
          <dd>
            {attachmentUrl
              ? <a href={attachmentUrl} className="text-navy underline" rel="noreferrer">Download attachment</a>
              : e.attachment_path ? 'Attachment unavailable' : 'None'}
            {attachmentUrl && <span className="ml-2 text-black/60">(link expires in {SIGNED_URL_TTL_SECONDS}s; reload for a new one)</span>}
          </dd>
        </div>
      </dl>

      <EnquiryControls id={e.id} status={e.status} notes={e.internal_notes ?? ''} />
    </main>
  )
}
