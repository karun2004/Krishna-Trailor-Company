import { createHmac } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const TAG = `e2e-contact-${Date.now()}`
const hashes: string[] = []
const hashIp = (ip: string) => createHmac('sha256', 'ktc-enquiry-ip-pepper').update(ip).digest('hex')
const ipFor = (n: number) => {
  const ip = `192.0.2.${n}`
  hashes.push(hashIp(ip))
  return ip
}
const rowsByTag = async () => (await svc.from('enquiries').select('*').like('name', `${TAG}%`)).data ?? []

test.afterAll(async () => {
  const rows = await rowsByTag()
  const paths = rows.map((r) => r.attachment_path).filter(Boolean) as string[]
  if (paths.length) await svc.storage.from('enquiry-attachments').remove(paths)
  if (rows.length) await svc.from('enquiries').delete().in('id', rows.map((r) => r.id))
  await svc.from('enquiry_rate_events').delete().in('ip_hash', hashes)
})

test('industrial enquiry with attachment -> success UI, row and private object', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': ipFor(201) })
  await page.goto('/contact')
  await expect(page.getByRole('tab', { name: 'Industrial enquiry' })).toHaveAttribute('aria-selected', 'true')
  const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#888' } }).png().toBuffer()
  await page.getByLabel('Name', { exact: false }).first().fill(`${TAG} Asha`)
  await page.getByLabel('Phone').fill('+91 98765 43210')
  await page.getByLabel('Cargo type').fill('Transformer')
  await page.getByLabel('Pickup location').fill('Vadodara')
  await page.getByLabel('Destination').fill('Mumbai')
  await page.getByLabel('Attachment').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png })
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByTestId('enquiry-success')).toBeVisible()
  await expect(page.getByTestId('form-status')).toHaveText('Enquiry sent')
  const rows = await rowsByTag()
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({ enquiry_type: 'industrial', status: 'new' })
  expect(rows[0].attachment_path).toBeTruthy()
  const dl = await svc.storage.from('enquiry-attachments').download(rows[0].attachment_path)
  expect(dl.error).toBeNull()
  const pub = await page.request.get(`${s.url}/storage/v1/object/public/enquiry-attachments/${rows[0].attachment_path}`)
  expect(pub.ok()).toBe(false)
})

test('travel enquiry preselected via ?type=travel -> success and row', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': ipFor(202) })
  await page.goto('/contact?type=travel')
  await expect(page.getByRole('tab', { name: 'Travel enquiry' })).toHaveAttribute('aria-selected', 'true')
  await page.getByLabel('Name').fill(`${TAG} Ravi`)
  await page.getByLabel('Phone').fill('9876543210')
  await page.getByLabel('Requirement').fill('Sleeper bus')
  await page.getByLabel('Passengers').fill('32')
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByTestId('enquiry-success')).toBeVisible()
  const rows = (await rowsByTag()).filter((r) => r.enquiry_type === 'travel')
  expect(rows).toHaveLength(1)
  expect(rows[0].division).toBe('radhe_travels')
})

test('client-side validation shows field errors with aria wiring and sends nothing', async ({ page }) => {
  let posted = 0
  await page.route('**/api/enquiry', (r) => { posted++; return r.abort() })
  await page.goto('/contact')
  await page.getByLabel('Email').fill('nope')
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  const name = page.getByLabel('Name')
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  const descId = await name.getAttribute('aria-describedby')
  await expect(page.locator(`[id="${descId}"]`)).toContainText('required')
  await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByTestId('form-error')).toBeVisible()
  // bad attachment type
  await page.getByLabel('Attachment').setInputFiles({ name: 'x.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') })
  await expect(page.getByLabel('Attachment')).toHaveAttribute('aria-invalid', 'true')
  expect(posted).toBe(0)
})

test('429 shows friendly retry message; 400 fields map; network error', async ({ page }) => {
  await page.goto('/contact?type=travel')
  const fill = async () => {
    await page.getByLabel('Name').fill(`${TAG} mock`)
    await page.getByLabel('Phone').fill('9876543210')
    await page.getByLabel('Requirement').fill('Bus')
  }
  await fill()
  await page.route('**/api/enquiry', (r) =>
    r.fulfill({ status: 429, headers: { 'Retry-After': '300' }, contentType: 'application/json', body: JSON.stringify({ error: 'You have sent several enquiries recently. Please wait.' }) }))
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByTestId('form-error')).toContainText('several enquiries')
  await expect(page.getByTestId('form-error')).toContainText('5 minute')
  await expect(page.getByRole('button', { name: 'Send enquiry' })).toBeEnabled()

  await page.unroute('**/api/enquiry')
  await page.route('**/api/enquiry', (r) =>
    r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'Please check the form.', fields: { route: 'Server says no' } }) }))
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByLabel('Route')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Server says no')).toBeVisible()

  await page.unroute('**/api/enquiry')
  await page.route('**/api/enquiry', (r) => r.abort())
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByTestId('form-error')).toContainText('could not reach')
})

test('side panel shows head office phones with tel links', async ({ page }) => {
  await page.goto('/contact')
  const panel = page.getByRole('complementary', { name: 'Contact details' })
  await expect(panel.locator('a[href="tel:9815413468"]')).toBeVisible()
  await expect(panel.locator('a[href="tel:01724640644"]')).toBeVisible()
  await expect(panel.locator('a[href^="https://wa.me/91"]')).toBeVisible()
})

for (const w of [390, 1440]) {
  test(`no horizontal overflow at ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 })
    for (const u of ['/contact', '/contact?type=travel']) {
      await page.goto(u)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    }
  })
}
