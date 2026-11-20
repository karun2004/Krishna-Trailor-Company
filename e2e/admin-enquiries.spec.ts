import { chromium, expect, test, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'node:crypto'
import sharp from 'sharp'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const TAG = `e2eadm${Date.now().toString(36)}`
const hashIp = (ip: string) => createHmac('sha256', 'ktc-enquiry-ip-pepper').update(ip).digest('hex')
const ips = [`192.0.2.${(Date.now() % 200) + 10}`, `192.0.2.${((Date.now() + 7) % 200) + 10}`]
const created: { id: string; path: string | null }[] = []

test.afterAll(async () => {
  const { data } = await svc.from('enquiries').select('id,attachment_path').ilike('name', `%${TAG}%`)
  for (const r of data ?? []) if (r.attachment_path) await svc.storage.from('enquiry-attachments').remove([r.attachment_path])
  await svc.from('enquiries').delete().ilike('name', `%${TAG}%`)
  await svc.from('enquiry_rate_events').delete().in('ip_hash', ips.map(hashIp))
  void created
})

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(s.admin.email)
  await page.getByLabel('Password').fill(s.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin$/)
}

test('enquiries: search, filter, open, signed attachment, status flow, delete', async ({ request }) => {
  const png = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#f28c28' } }).png().toBuffer()
  const res = await request.post('/api/enquiry', {
    headers: { 'x-forwarded-for': ips[0] },
    multipart: {
      type: 'industrial', name: `${TAG} <b>Asha</b>`, company: 'Patel Works', phone: '9876543210',
      email: 'asha@example.com', cargoType: 'Transformer', pickup: 'Vadodara', destination: 'Mumbai',
      message: 'Need escort', attachment: { name: 'doc.png', mimeType: 'image/png', buffer: png },
    },
  })
  expect(res.status()).toBe(201)
  const id = (await res.json()).id as string
  const tres = await request.post('/api/enquiry', {
    headers: { 'x-forwarded-for': ips[1] },
    data: { type: 'travel', name: `${TAG} Ravi`, phone: '9876543210', requirement: 'Bus', passengerCount: 10, route: 'A to B', travelDate: '2026-12-20' },
  })
  expect(tres.status()).toBe(201)

  // unauthenticated detail access redirects to login
  const anon = await chromium.launch()
  const anonPage = await anon.newPage({ baseURL: 'http://127.0.0.1:3100' })
  await anonPage.goto(`/admin/enquiries/${id}`)
  await expect(anonPage).toHaveURL(/\/admin\/login/)
  await anon.close()

  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:3100' })
  await login(page)
  await page.goto('/admin/enquiries')
  await expect(page.getByRole('heading', { name: 'Enquiries' })).toBeVisible()

  await page.getByLabel('Search enquiries').fill(TAG)
  await page.getByRole('button', { name: 'Apply' }).click()
  const table = page.getByRole('table')
  await expect(table.getByRole('row').filter({ hasText: TAG })).toHaveCount(2)
  // text is escaped, not rendered as HTML
  await expect(table.getByText('<b>Asha</b>')).toBeVisible()

  // type filter
  await page.getByLabel('Type').selectOption('travel')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(table.getByRole('row').filter({ hasText: TAG })).toHaveCount(1)
  await page.getByLabel('Type').selectOption('')
  // status filter
  await page.getByLabel('Status').selectOption('completed')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(table.getByRole('row').filter({ hasText: TAG })).toHaveCount(0)
  await page.getByLabel('Status').selectOption('new')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(table.getByRole('row').filter({ hasText: TAG })).toHaveCount(2)

  // open
  await table.getByRole('row').filter({ hasText: 'Asha' }).getByRole('link', { name: /view/i }).click()
  await expect(page).toHaveURL(new RegExp(`/admin/enquiries/${id}$`))
  await expect(page.getByText('Patel Works')).toBeVisible()
  await expect(page.getByText('Transformer')).toBeVisible()

  // attachment via short-lived signed URL
  const href = await page.getByRole('link', { name: /download attachment/i }).getAttribute('href')
  expect(href).toContain('token=')
  const file = await request.get(href!)
  expect(file.status()).toBe(200)
  expect((await file.body()).equals(png)).toBe(true)
  // bucket stays private: bare public URL does not serve it
  const pub = await request.get(href!.split('?')[0].replace('/object/sign/', '/object/public/'))
  expect(pub.status()).not.toBe(200)

  // status flow + notes (wait for hydration of the client controls)
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Internal notes').fill('Called customer')
  await page.getByRole('button', { name: 'Save notes' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Notes saved' })).toBeVisible({ timeout: 20000 })
  await page.getByLabel('Change status').selectOption('contacted')
  await page.getByRole('button', { name: 'Update status' }).click()
  await expect.poll(async () => (await svc.from('enquiries').select('status').eq('id', id).single()).data?.status).toBe('contacted')
  await page.getByLabel('Change status').selectOption('completed')
  await page.getByRole('button', { name: 'Update status' }).click()
  await expect.poll(async () => (await svc.from('enquiries').select('status,internal_notes').eq('id', id).single()).data?.status).toBe('completed')
  expect((await svc.from('enquiries').select('internal_notes').eq('id', id).single()).data?.internal_notes).toBe('Called customer')

  // delete with confirm
  await page.getByRole('button', { name: 'Delete enquiry' }).click()
  await page.getByRole('button', { name: 'Confirm delete' }).click()
  await expect(page).toHaveURL(/\/admin\/enquiries$/)
  expect((await svc.from('enquiries').select('id').eq('id', id)).data).toHaveLength(0)
  await browser.close()
})
