import { chromium, expect, test, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const tag = `E2E-${crypto.randomUUID().slice(0, 8)}`
const mediaPath = `e2e/${tag}.jpg`
const mediaAlt = `${tag} media`

test.setTimeout(240_000)
test.use({ actionTimeout: 20_000, navigationTimeout: 90_000 })
test.describe.configure({ mode: 'serial' })
let mediaId = ''

test.beforeAll(async () => {
  const { data, error } = await svc
    .from('media_assets')
    .insert({ storage_path: mediaPath, alt: mediaAlt, category: 'homepage', mime_type: 'image/jpeg' })
    .select('id')
    .single()
  expect(error).toBeNull()
  mediaId = data!.id as string
})

test.afterAll(async () => {
  await svc.from('projects').delete().like('title', `${tag}%`)
  await svc.from('gallery_albums').delete().like('title', `${tag}%`)
  await svc.from('client_logos').delete().like('name', `${tag}%`)
  await svc.from('testimonials').delete().like('author_name', `${tag}%`)
  await svc.from('media_assets').delete().eq('storage_path', mediaPath)
})

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(s.admin.email)
  await page.getByLabel('Password').fill(s.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin$/)
}

async function deleteRow(page: Page, label: string) {
  await page.getByRole('button', { name: `Delete ${label}` }).click()
  await page.getByRole('button', { name: 'Confirm delete' }).click()
  await expect(page.getByRole('row', { name: new RegExp(label) })).toHaveCount(0)
}

test('unauthenticated visitors are redirected from every group B screen', async ({ page }) => {
  for (const p of ['projects', 'gallery', 'clients', 'testimonials']) {
    await page.goto(`/admin/${p}`)
    await expect(page).toHaveURL(/\/admin\/login/)
    await page.goto(`/admin/${p}/new`)
    await expect(page).toHaveURL(/\/admin\/login/)
  }
})

/** Searches the open MediaPicker dialog and selects the test media (retries: the initial unfiltered load can land late). */
async function pickMedia(page: Page) {
  const pick = page.getByRole('button', { name: `Select ${mediaAlt}` })
  await expect(async () => {
    await page.getByRole('searchbox').fill(mediaAlt)
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(pick).toBeVisible({ timeout: 3000 })
  }).toPass({ timeout: 20_000 })
  await pick.click()
}

async function open() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:3100' })
  await login(page)
  return { browser, page }
}

test('projects: create, edit, images, delete', async () => {
  const { browser, page } = await open()

  // ---------- projects
  const title = `${tag} Project`
  await page.goto('/admin/projects/new')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Title is required')).toBeVisible()
  await page.getByLabel('Title').fill(title)
  await page.getByLabel('Location').fill('Pune')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/projects$/)
  await expect(page.getByRole('row', { name: new RegExp(title) })).toBeVisible()
  const proj = (await svc.from('projects').select('*').eq('title', title).single()).data!
  expect(proj).toMatchObject({ location: 'Pune', published: false })

  await page.getByRole('link', { name: `Edit ${title}` }).click()
  await page.waitForURL(/\/admin\/projects\/[0-9a-f-]{36}$/)
  await page.getByLabel('Location').fill('Mumbai')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/projects$/)
  expect((await svc.from('projects').select('location').eq('id', proj.id).single()).data!.location).toBe('Mumbai')

  // multi-image: add (tagged), retag, caption, reorder, remove
  await page.goto(`/admin/projects/${proj.id}`)
  for (const phase of ['before', 'during']) {
    await page.getByLabel('Tag for new images').selectOption(phase)
    await page.getByRole('button', { name: /Choose image/ }).last().click()
    await pickMedia(page)
    await expect(page.getByTestId('media-item')).toHaveCount(phase === 'before' ? 1 : 2)
  }
  const imgs = async () =>
    (await svc.from('project_images').select('id, phase, caption, sort_order').eq('project_id', proj.id).order('sort_order')).data!
  expect((await imgs()).map((i) => i.phase)).toEqual(['before', 'during'])

  await page.getByTestId('media-item').nth(1).getByLabel(/^Tag/).selectOption('after')
  await expect.poll(async () => (await imgs())[1]!.phase).toBe('after')
  const cap = page.getByTestId('media-item').nth(0).getByLabel(/^Caption/)
  await cap.fill('Site before work')
  await cap.blur()
  await expect.poll(async () => (await imgs())[0]!.caption).toBe('Site before work')

  const firstId = (await imgs())[0]!.id
  await page.getByRole('button', { name: /^Move .* down$/ }).first().click()
  await expect.poll(async () => (await imgs())[1]!.id).toBe(firstId)

  await page.getByRole('button', { name: /^Remove / }).first().click()
  await expect.poll(async () => (await imgs()).length).toBe(1)
  await page.getByRole('button', { name: /^Remove / }).first().click()
  await expect.poll(async () => (await imgs()).length).toBe(0)

  await page.goto('/admin/projects')
  await deleteRow(page, title)
  expect((await svc.from('projects').select('id').eq('id', proj.id)).data).toHaveLength(0)

  await browser.close()
})

test('gallery: create, edit, album images, delete', async () => {
  const { browser, page } = await open()
  const album = `${tag} Album`
  await page.goto('/admin/gallery/new')
  await page.getByLabel('Title').fill(album)
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/gallery$/)
  const alb = (await svc.from('gallery_albums').select('*').eq('title', album).single()).data!
  await page.getByRole('link', { name: `Edit ${album}` }).click()
  await page.waitForURL(/\/admin\/gallery\/[0-9a-f-]{36}$/)
  await page.getByLabel('Description').fill('Edited')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/gallery$/)
  expect((await svc.from('gallery_albums').select('description').eq('id', alb.id).single()).data!.description).toBe('Edited')

  await page.goto(`/admin/gallery/${alb.id}`)
  await page.getByRole('button', { name: /Choose image/ }).last().click()
  await pickMedia(page)
  await expect(page.getByTestId('media-item')).toHaveCount(1)
  await page.getByRole('button', { name: /^Remove / }).click()
  await expect.poll(async () => (await svc.from('gallery_album_media').select('id').eq('album_id', alb.id)).data!.length).toBe(0)
  await page.goto('/admin/gallery')
  await deleteRow(page, album)

  await browser.close()
})

test('clients: create, edit, delete', async () => {
  const { browser, page } = await open()
  const client = `${tag} Client`
  await page.goto('/admin/clients/new')
  await page.getByLabel('Name').fill(client)
  await page.getByLabel('Website URL').fill('not a url')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText(/full URL/)).toBeVisible()
  await page.getByLabel('Website URL').fill('https://example.com')
  await page.getByLabel('Logo').click()
  // The picker's Search button currently submits the enclosing EntityForm (dialog is nested in it), so choose from the
  // category-filtered initial list instead of searching.
  await page.getByRole('dialog').getByRole('combobox').selectOption('homepage')
  await page.getByRole('button', { name: `Select ${mediaAlt}` }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/clients$/)
  const cl = (await svc.from('client_logos').select('*').eq('name', client).single()).data!
  expect(cl).toMatchObject({ media_id: mediaId, website_url: 'https://example.com', published: false })
  await page.getByRole('link', { name: `Edit ${client}` }).click()
  await page.getByLabel('Website URL').fill('https://example.org')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/clients$/)
  expect((await svc.from('client_logos').select('website_url').eq('id', cl.id).single()).data!.website_url).toBe('https://example.org')
  await deleteRow(page, client)

  await browser.close()
})

test('testimonials: create, approve, publish, delete', async () => {
  const { browser, page } = await open()
  const author = `${tag} Author`
  await page.goto('/admin/testimonials/new')
  await page.getByLabel('Author name').fill(author)
  await page.getByLabel('Quote').fill('Great service')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/testimonials$/)
  const t = (await svc.from('testimonials').select('*').eq('author_name', author).single()).data!
  expect(t).toMatchObject({ approved: false, published: false })
  await page.getByRole('link', { name: `Edit ${author}` }).click()
  await page.getByLabel('Approved').check()
  await page.getByLabel('Published').check()
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/testimonials$/)
  expect((await svc.from('testimonials').select('approved, published').eq('id', t.id).single()).data).toEqual({ approved: true, published: true })
  await deleteRow(page, author)

  await browser.close()
})
