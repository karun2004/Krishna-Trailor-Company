import { chromium, expect, test, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const TAG = `e2elib${Date.now().toString(36)}`
const cleanup = { divisionId: '' }

const img = (color: string, w = 40, h = 30) =>
  sharp({ create: { width: w, height: h, channels: 3, background: color } }).png().toBuffer()

test.afterAll(async () => {
  if (cleanup.divisionId) await svc.from('business_divisions').delete().eq('id', cleanup.divisionId)
  const { data } = await svc.from('media_assets').select('id,storage_path').or(`alt.ilike.%${TAG}%,storage_path.ilike.%${TAG}%`)
  const rows = data ?? []
  if (rows.length) {
    await svc.from('media_assets').delete().in('id', rows.map((r) => r.id))
    await svc.storage.from('media').remove(rows.map((r) => r.storage_path))
  }
})

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(s.admin.email)
  await page.getByLabel('Password').fill(s.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin$/)
}

test('media library: upload, search, filter, edit, usage, replace, reorder, delete', async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:3100' })
  page.on('dialog', (d) => d.dismiss())
  await login(page)
  await page.goto('/admin/media')
  await expect(page.getByRole('heading', { name: 'Media library' })).toBeVisible()

  // --- multi-file upload with a category, plus a rejected file with a readable error
  await page.getByLabel('Upload category').selectOption('cranes')
  await page.getByLabel('Choose images to upload').setInputFiles([
    { name: `${TAG}-alpha.png`, mimeType: 'image/png', buffer: await img('#f28c28') },
    { name: `${TAG}-beta.png`, mimeType: 'image/png', buffer: await img('#14243a') },
    { name: `${TAG}-bad.png`, mimeType: 'image/png', buffer: Buffer.from('not an image') },
  ])
  const queue = page.getByRole('list', { name: 'Upload queue' })
  await expect(queue.getByText(`${TAG}-alpha.png`)).toBeVisible()
  await expect(queue.getByText(/Uploaded/)).toHaveCount(2)
  await expect(queue.getByRole('listitem').filter({ hasText: `${TAG}-bad.png` })).toContainText(/image/i)

  const grid = page.getByRole('list', { name: 'Media assets' })
  // --- search by name
  await page.getByLabel('Search media').fill(`${TAG}-alpha`)
  await expect(grid.getByRole('listitem')).toHaveCount(1)
  await page.getByLabel('Search media').fill(TAG)
  await expect(grid.getByRole('listitem')).toHaveCount(2)

  // --- category filter
  await page.getByLabel('Filter by category').selectOption('jcb')
  await expect(grid.getByRole('listitem')).toHaveCount(0)
  await expect(page.getByText('No media match')).toBeVisible()
  await page.getByLabel('Filter by category').selectOption('cranes')
  await expect(grid.getByRole('listitem')).toHaveCount(2)

  // --- edit alt + caption
  await grid.getByRole('button', { name: new RegExp(`${TAG}-alpha`) }).click()
  const detail = page.getByRole('region', { name: 'Asset details' })
  await detail.getByLabel('Alt text').fill(`${TAG} Mobile crane at site`)
  await detail.getByLabel('Caption').fill('Lifting day')
  await detail.getByRole('button', { name: 'Save details' }).click()
  await expect(detail.getByText('Saved')).toBeVisible()
  const { data: saved } = await svc.from('media_assets').select('id,alt,caption,storage_path').ilike('alt', `${TAG} Mobile%`).single()
  expect(saved).toMatchObject({ caption: 'Lifting day' })
  const alphaId = saved!.id as string

  // --- usage lookup: unused first, then link to a division and see it listed
  await expect(detail.getByText('Not used anywhere')).toBeVisible()
  const { data: div } = await svc.from('business_divisions')
    .insert({ slug: `${TAG}-div`, name: `${TAG} Division`, hero_media_id: alphaId }).select('id').single()
  cleanup.divisionId = div!.id
  await page.reload()
  await page.getByLabel('Search media').fill(TAG)
  await page.getByRole('list', { name: 'Media assets' }).getByRole('button', { name: new RegExp(`${TAG} Mobile`) }).click()
  const detail2 = page.getByRole('region', { name: 'Asset details' })
  const usage = detail2.getByRole('list', { name: 'Where used' })
  await expect(usage).toContainText(`${TAG} Division`)
  await expect(usage).toContainText(/Division/i)

  // --- replace keeps id, changes file
  await detail2.getByLabel('Replace image').setInputFiles({
    name: `${TAG}-new.png`, mimeType: 'image/png', buffer: await img('#00ff00', 60, 20),
  })
  await expect(detail2.getByText('Image replaced')).toBeVisible()
  const { data: rep } = await svc.from('media_assets').select('id,width,height,storage_path').eq('id', alphaId).single()
  expect(rep).toMatchObject({ width: 60, height: 20 })
  expect(rep!.storage_path).not.toBe(saved!.storage_path)

  // --- reorder: move the top item down, persists sort_order across reload
  const names = async () => (await grid.getByRole('listitem').allInnerTexts()).map((t) => t.trim())
  await page.getByLabel('Search media').fill(TAG)
  const before = await names()
  expect(before).toHaveLength(2)
  const saved2 = page.waitForResponse((r) => r.url().endsWith("/api/admin/media/reorder") && r.ok())
  await grid.getByRole("listitem").first().getByRole("button", { name: /^Move later/ }).click()
  await saved2
  await expect(async () => {
    const now = await names()
    expect(now[0]).toBe(before[1])
  }).toPass()
  await page.reload()
  await page.getByLabel('Search media').fill(TAG)
  await expect(async () => expect((await names())[0]).toBe(before[1])).toPass()

  // --- delete: warns when in use, requires confirm
  await page.getByRole('list', { name: 'Media assets' }).getByRole('button', { name: new RegExp(`${TAG} Mobile`) }).click()
  const d3 = page.getByRole('region', { name: 'Asset details' })
  await d3.getByRole('button', { name: 'Delete' }).click()
  const dlg = page.getByRole('alertdialog')
  await expect(dlg).toContainText(/used in 1 place/i)
  await dlg.getByRole('button', { name: 'Cancel' }).click()
  expect((await svc.from('media_assets').select('id').eq('id', alphaId)).data).toHaveLength(1)
  await d3.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete anyway' }).click()
  await expect(page.getByRole('list', { name: 'Media assets' }).getByRole('listitem')).toHaveCount(1)
  expect((await svc.from('media_assets').select('id').eq('id', alphaId)).data).toEqual([])
  const { data: divAfter } = await svc.from('business_divisions').select('hero_media_id').eq('id', cleanup.divisionId).single()
  expect(divAfter!.hero_media_id).toBeNull()

  await browser.close()
})

test('media page and new API routes require admin', async ({ request }) => {
  const id = crypto.randomUUID()
  expect((await request.get(`/api/admin/media/${id}/usage`)).status()).toBe(401)
  expect((await request.post('/api/admin/media/reorder', { data: { ids: [id] } })).status()).toBe(401)
  const res = await request.get('/admin/media', { maxRedirects: 0 })
  expect([302, 303, 307, 308]).toContain(res.status())
})
