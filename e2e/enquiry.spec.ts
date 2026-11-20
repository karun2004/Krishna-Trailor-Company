import { createHmac } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const TAG = `e2e-enq-${Date.now()}`
const ids: string[] = []
const hashes: string[] = []

// Same derivation as src/lib/rate-limit.ts hashIp (default pepper constant; no ENQUIRY_IP_PEPPER in e2e).
const hashIp = (ip: string) => createHmac('sha256', 'ktc-enquiry-ip-pepper').update(ip).digest('hex')
let ipCounter = 0
const newIp = () => {
  const ip = `203.0.113.${(Date.now() + ++ipCounter) % 250}`
  hashes.push(hashIp(ip))
  return ip
}
// Unique-ish IPs per test via different /24 hosts plus a counter in the last octet.
const ipFor = (n: number) => {
  const ip = `198.51.100.${n}`
  hashes.push(hashIp(ip))
  return ip
}
void newIp

const industrial = (over: Record<string, unknown> = {}) => ({
  type: 'industrial', name: `${TAG} Asha`, company: 'Patel Works', phone: '+91 98765 43210',
  email: 'asha@example.com', cargoType: 'Transformer', weight: '45t', dimensions: '6x3x3',
  pickup: 'Vadodara', destination: 'Mumbai', requiredDate: '2026-12-01', message: 'Need escort', ...over,
})
const travel = (over: Record<string, unknown> = {}) => ({
  type: 'travel', name: `${TAG} Ravi`, phone: '9876543210', requirement: 'Sleeper bus',
  passengerCount: 32, route: 'Surat to Goa', travelDate: '2026-12-20', message: 'Hello', ...over,
})
const post = (request: import('@playwright/test').APIRequestContext, data: unknown, ip: string) =>
  request.post('/api/enquiry', { data, headers: { 'x-forwarded-for': ip } })

async function attachmentCount() {
  const folders = await svc.storage.from('enquiry-attachments').list('', { limit: 1000 })
  let n = 0
  for (const f of folders.data ?? []) {
    const { data } = await svc.storage.from('enquiry-attachments').list(f.name, { limit: 1000 })
    n += (data ?? []).filter((o) => o.name !== '.emptyFolderPlaceholder').length
  }
  return n
}
const rowsByTag = async () =>
  (await svc.from('enquiries').select('*').like('name', `${TAG}%`)).data ?? []

test.afterAll(async () => {
  const rows = await rowsByTag()
  const paths = rows.map((r) => r.attachment_path).filter(Boolean) as string[]
  if (paths.length) await svc.storage.from('enquiry-attachments').remove(paths)
  if (rows.length) await svc.from('enquiries').delete().in('id', rows.map((r) => r.id))
  await svc.from('enquiry_rate_events').delete().in('ip_hash', hashes)
  void ids
})

test('valid industrial enquiry -> 201 and a new row', async ({ request }) => {
  const res = await post(request, industrial(), ipFor(10))
  expect(res.status()).toBe(201)
  const { id } = await res.json()
  const { data } = await svc.from('enquiries').select('*').eq('id', id).single()
  expect(data).toMatchObject({
    status: 'new', division: 'heavy_haulage', enquiry_type: 'industrial', phone: '+91 98765 43210',
    company: 'Patel Works', attachment_path: null,
  })
  expect(data.details).toMatchObject({ cargoType: 'Transformer', pickup: 'Vadodara', destination: 'Mumbai' })
})

test('valid travel enquiry -> 201 and a new row', async ({ request }) => {
  const res = await post(request, travel(), ipFor(11))
  expect(res.status()).toBe(201)
  const { data } = await svc.from('enquiries').select('*').eq('id', (await res.json()).id).single()
  expect(data).toMatchObject({ status: 'new', division: 'radhe_travels', enquiry_type: 'travel' })
  expect(data.details).toMatchObject({ requirement: 'Sleeper bus', passengerCount: 32 })
})

test('invalid payloads -> 400 with field-level errors and no row', async ({ request }) => {
  const before = (await rowsByTag()).length
  const res = await post(request, industrial({ name: `${TAG} bad`, email: 'nope', cargoType: '' }), ipFor(12))
  expect(res.status()).toBe(400)
  const body = await res.json()
  expect(body.fields).toHaveProperty('email')
  expect(body.fields).toHaveProperty('cargoType')
  const t = await post(request, travel({ name: `${TAG} bad`, passengerCount: 0 }), ipFor(12))
  expect(t.status()).toBe(400)
  expect((await t.json()).fields).toHaveProperty('passengerCount')
  const u = await post(request, { type: 'other' }, ipFor(12))
  expect(u.status()).toBe(400)
  expect((await rowsByTag()).length).toBe(before)
})

test('honeypot submissions are accepted silently and store nothing', async ({ request }) => {
  const before = (await rowsByTag()).length
  const res = await post(request, industrial({ name: `${TAG} bot`, website: 'http://spam' }), ipFor(13))
  expect(res.status()).toBe(201)
  expect((await rowsByTag()).length).toBe(before)
})

test('multipart with a valid image attachment is stored privately and path saved', async ({ request }) => {
  const png = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#f28c28' } }).png().toBuffer()
  const { type: _t, ...fields } = industrial({ name: `${TAG} img` })
  void _t
  const res = await request.post('/api/enquiry', {
    headers: { 'x-forwarded-for': ipFor(14) },
    multipart: { type: 'industrial', ...(fields as Record<string, string>), attachment: { name: 'a.png', mimeType: 'image/png', buffer: png } },
  })
  expect(res.status()).toBe(201)
  const { data } = await svc.from('enquiries').select('attachment_path').eq('id', (await res.json()).id).single()
  expect(data?.attachment_path).toMatch(/^\d{4}-\d{2}\/[0-9a-f-]{36}\.png$/)
  const dl = await svc.storage.from('enquiry-attachments').download(data!.attachment_path)
  expect(dl.error).toBeNull()
  // private bucket: not reachable via the public URL
  const pub = await request.get(`${s.url}/storage/v1/object/public/enquiry-attachments/${data!.attachment_path}`)
  expect(pub.status()).toBeGreaterThanOrEqual(400)
})

test('bad attachments -> 400, no row and no object', async ({ request }) => {
  const objects = await attachmentCount()
  const rows = (await rowsByTag()).length
  const send = (name: string, mimeType: string, buffer: Buffer, tag: string) =>
    request.post('/api/enquiry', {
      headers: { 'x-forwarded-for': ipFor(15) },
      multipart: {
        type: 'industrial', name: `${TAG} ${tag}`, phone: '9876543210', cargoType: 'x', pickup: 'a', destination: 'b',
        attachment: { name, mimeType, buffer },
      },
    })
  // disallowed type
  expect((await send('a.gif', 'image/gif', Buffer.from('GIF89a'), 'gif')).status()).toBe(400)
  // PDF type but not a PDF
  expect((await send('a.pdf', 'application/pdf', Buffer.from('not a pdf at all'), 'fakepdf')).status()).toBe(400)
  // PNG type, garbage bytes
  expect((await send('a.png', 'image/png', Buffer.from('garbage bytes here'), 'fakepng')).status()).toBe(400)
  // real JPEG claimed as PNG
  const jpg = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#000' } }).jpeg().toBuffer()
  expect((await send('a.png', 'image/png', jpg, 'mismatch')).status()).toBe(400)
  // oversize
  const big = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(10 * 1024 * 1024)])
  expect([400, 413]).toContain((await send('b.pdf', 'application/pdf', big, 'big')).status())
  expect(await attachmentCount()).toBe(objects)
  expect((await rowsByTag()).length).toBe(rows)
})

test('a real PDF attachment is accepted', async ({ request }) => {
  const res = await request.post('/api/enquiry', {
    headers: { 'x-forwarded-for': ipFor(16) },
    multipart: {
      type: 'industrial', name: `${TAG} pdf`, phone: '9876543210', cargoType: 'x', pickup: 'a', destination: 'b',
      attachment: { name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') },
    },
  })
  expect(res.status()).toBe(201)
})

test('6th submission from one IP within 10 minutes -> 429, Retry-After, no row', async ({ request }) => {
  const ip = ipFor(20)
  for (let i = 1; i <= 5; i++) {
    const r = await post(request, industrial({ name: `${TAG} rl${i}` }), ip)
    expect(r.status()).toBe(201)
  }
  const before = (await rowsByTag()).length
  const sixth = await post(request, industrial({ name: `${TAG} rl6` }), ip)
  expect(sixth.status()).toBe(429)
  expect(Number(sixth.headers()['retry-after'])).toBeGreaterThan(0)
  expect((await sixth.json()).error).toMatch(/wait a few minutes/i)
  expect((await rowsByTag()).length).toBe(before)
  expect((await rowsByTag()).some((r) => r.name === `${TAG} rl6`)).toBe(false)
  // a different IP is unaffected; only the hash (not the raw IP) is stored
  expect((await post(request, industrial({ name: `${TAG} other` }), ipFor(21))).status()).toBe(201)
  const { data } = await svc.from('enquiry_rate_events').select('ip_hash').eq('ip_hash', hashIp(ip))
  expect(data).toHaveLength(5)
  expect(JSON.stringify(data)).not.toContain(ip)
})
