import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkEnquiryRateLimit, getClientIp } from '@/lib/rate-limit'
import {
  ENQUIRY_ATTACHMENT_MIME,
  MAX_ATTACHMENT_BYTES,
  attachmentMetaSchema,
  fieldErrors,
  industrialEnquirySchema,
  travelEnquirySchema,
  type EnquiryAttachmentMime,
} from '@/lib/validation/enquiry'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = MAX_ATTACHMENT_BYTES + 512 * 1024

function bad(error: string, fields?: Record<string, string>, status = 400) {
  return NextResponse.json({ error, ...(fields ? { fields } : {}) }, { status })
}

const SHARP_FORMATS: Record<string, EnquiryAttachmentMime> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heif: 'image/avif', // sharp reports AVIF as heif (compression av1)
}

/** Verify real content matches the declared type: PDF by magic bytes, images via sharp. */
async function verifyBytes(buf: Buffer, declared: EnquiryAttachmentMime): Promise<boolean> {
  if (declared === 'application/pdf') return buf.subarray(0, 5).toString('latin1') === '%PDF-'
  try {
    const meta = await sharp(buf, { failOn: 'error' }).metadata()
    if (!meta.format || SHARP_FORMATS[meta.format] !== declared) return false
    if (meta.format === 'heif' && meta.compression !== 'av1') return false
    return true
  } catch {
    return false
  }
}

function compact(o: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))
}

type Row = {
  division: 'krishna_trailor' | 'heavy_haulage' | 'radhe_travels'
  enquiry_type: string
  name: string
  phone: string
  email: string | null
  company: string | null
  message: string | null
  details: Record<string, unknown>
}

export async function POST(req: Request) {
  const len = Number(req.headers.get('content-length'))
  if (Number.isFinite(len) && len > MAX_BODY_BYTES) return bad('The request is too large.', undefined, 413)

  let raw: Record<string, unknown>
  let file: File | undefined
  const ctype = req.headers.get('content-type') ?? ''
  try {
    if (ctype.includes('multipart/form-data')) {
      const form = await req.formData()
      raw = {}
      for (const [k, v] of form.entries()) {
        if (typeof v === 'string') raw[k] = v
        else if (k === 'attachment' && v.size > 0) file = v
      }
    } else if (ctype.includes('application/json')) {
      const body: unknown = await req.json()
      if (typeof body !== 'object' || body === null || Array.isArray(body)) return bad('Invalid request body.')
      raw = body as Record<string, unknown>
    } else {
      return bad('Send JSON or multipart/form-data.', undefined, 415)
    }
  } catch {
    return bad('Could not read the request body.')
  }

  const { type, attachment: _ignored, ...input } = raw
  void _ignored
  if (type !== 'industrial' && type !== 'travel') {
    return bad('Please check the form.', { type: 'Must be "industrial" or "travel"' })
  }
  if (type === 'travel' && file) {
    return bad('Please check the form.', { attachment: 'Attachments are not accepted for travel enquiries' })
  }

  // 1. Validate fields and attachment before any write or rate-limit hit.
  let row: Row
  let website: string | undefined
  if (type === 'industrial') {
    const parsed = industrialEnquirySchema.safeParse({
      ...input,
      attachment: file ? { type: file.type, size: file.size } : undefined,
    })
    if (!parsed.success) return bad('Please check the form.', fieldErrors(parsed.error))
    const v = parsed.data
    website = v.website
    row = {
      division: v.division,
      enquiry_type: 'industrial',
      name: v.name,
      phone: v.phone,
      email: v.email ?? null,
      company: v.company ?? null,
      message: v.message ?? null,
      details: compact({
        cargoType: v.cargoType,
        weight: v.weight,
        dimensions: v.dimensions,
        pickup: v.pickup,
        destination: v.destination,
        requiredDate: v.requiredDate,
      }),
    }
  } else {
    const parsed = travelEnquirySchema.safeParse(input)
    if (!parsed.success) return bad('Please check the form.', fieldErrors(parsed.error))
    const v = parsed.data
    website = v.website
    row = {
      division: 'radhe_travels',
      enquiry_type: 'travel',
      name: v.name,
      phone: v.phone,
      email: null,
      company: null,
      message: v.message ?? null,
      details: compact({
        requirement: v.requirement,
        passengerCount: v.passengerCount,
        route: v.route,
        travelDate: v.travelDate,
      }),
    }
  }

  let attachment: { buffer: Buffer; mime: EnquiryAttachmentMime } | undefined
  if (file) {
    const meta = attachmentMetaSchema.parse({ type: file.type, size: file.size })
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!(await verifyBytes(buffer, meta.type))) {
      return bad('Please check the form.', { attachment: 'The file content does not match its type' })
    }
    attachment = { buffer, mime: meta.type }
  }

  // 2. Honeypot: pretend success, store nothing, spend no rate-limit budget.
  if (website) return NextResponse.json({ ok: true }, { status: 201 })

  // 3. Rate limit (DB-backed, per hashed IP).
  const admin = createAdminClient()
  const limit = await checkEnquiryRateLimit(admin, getClientIp(req.headers))
  if (!limit.ok) {
    if ('error' in limit) {
      return bad('We could not process your enquiry right now. Please try again shortly.', undefined, 503)
    }
    return NextResponse.json(
      {
        error:
          'You have sent several enquiries recently. Please wait a few minutes before trying again, or call us directly.',
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  // 4. Store the attachment (private bucket), then the row.
  let attachmentPath: string | null = null
  if (attachment) {
    attachmentPath = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ENQUIRY_ATTACHMENT_MIME[attachment.mime]}`
    const up = await admin.storage
      .from('enquiry-attachments')
      .upload(attachmentPath, attachment.buffer, { contentType: attachment.mime })
    if (up.error) return bad('Could not store the attachment.', undefined, 500)
  }

  const { data, error } = await admin
    .from('enquiries')
    .insert({ ...row, status: 'new', attachment_path: attachmentPath })
    .select('id')
    .single()
  if (error) {
    if (attachmentPath) await admin.storage.from('enquiry-attachments').remove([attachmentPath])
    return bad('Could not save your enquiry. Please try again.', undefined, 500)
  }
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 })
}
