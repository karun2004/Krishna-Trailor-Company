import { chromium, expect, request as pwRequest, test, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const tag = `E2E-${crypto.randomUUID().slice(0, 8)}`
const nameA = `${tag} Alpha`
const nameB = `${tag} Bravo`

const row = async (name: string) =>
  (await svc.from('services').select('*').eq('name', name).maybeSingle()).data

test.setTimeout(90_000)

test.afterAll(async () => {
  await svc.from('services').delete().like('name', `${tag}%`)
})

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(s.admin.email)
  await page.getByLabel('Password').fill(s.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin$/)
}

test('unauthenticated visitors are redirected away from the services screen', async ({ page }) => {
  await page.goto('/admin/services')
  await expect(page).toHaveURL(/\/admin\/login/)
  await page.goto('/admin/services/new')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('services CRUD: create, validate, edit, publish, reorder, delete; replayed action without cookie is rejected', async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:3100' })
  await login(page)

  // --- create (client-side validation first)
  await page.goto('/admin/services/new')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Name is required')).toBeVisible()
  await page.getByLabel('Name').fill(nameA)
  await expect(page.getByLabel('Slug')).toHaveValue(/^e2e-[0-9a-f]{8}-alpha$/)
  await page.getByLabel('Summary').fill('First summary')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/services$/)
  await expect(page.getByRole('row', { name: new RegExp(nameA) })).toBeVisible()
  const a = await row(nameA)
  expect(a).toMatchObject({ summary: 'First summary', published: false, verification_note: null })

  // duplicate slug -> server-side field error
  await page.goto('/admin/services/new')
  await page.getByLabel('Name').fill(`${tag} Dup`)
  await page.getByLabel('Slug').fill(a!.slug)
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText(/already in use/i)).toBeVisible()
  expect(await row(`${tag} Dup`)).toBeNull()

  // second row for reorder
  await page.goto('/admin/services/new')
  await page.getByLabel('Name').fill(nameB)
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/services$/)
  const b = await row(nameB)
  expect(b!.sort_order).toBeGreaterThan(a!.sort_order)

  // --- search
  await page.getByRole('searchbox', { name: /search/i }).fill('Bravo')
  await expect(page.getByRole('row', { name: new RegExp(nameA) })).toHaveCount(0)
  await expect(page.getByRole('row', { name: new RegExp(nameB) })).toBeVisible()
  await page.getByRole('searchbox', { name: /search/i }).fill(tag)

  // --- edit
  await page.getByRole('link', { name: `Edit ${nameA}` }).click()
  await page.waitForURL(/\/admin\/services\/[0-9a-f-]{36}$/)
  await expect(page.getByLabel('Name')).toHaveValue(nameA)
  await page.getByLabel('Summary').fill('Edited summary')
  await page.getByLabel('Verification note').fill('Confirm with owner')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/services$/)
  expect(await row(nameA)).toMatchObject({ summary: 'Edited summary', verification_note: 'Confirm with owner' })

  // --- publish / unpublish (capture the Server Action request to replay it unauthenticated)
  let captured: { headers: Record<string, string>; body: string | null } | null = null
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.headers()['next-action']) {
      captured = { headers: r.headers(), body: r.postData() }
    }
  })
  const toggle = page.getByRole('switch', { name: `Publish ${nameA}` })
  await page.getByRole('searchbox', { name: /search/i }).fill(tag)
  await toggle.click()
  await expect(toggle).toBeChecked()
  expect((await row(nameA))!.published).toBe(true)
  await toggle.click()
  await expect(toggle).not.toBeChecked()
  expect((await row(nameA))!.published).toBe(false)

  // replay the last (unpublish->publish style) action with no cookie: must not mutate
  await toggle.click() // publishes -> captured is a "publish=true" call
  await expect(toggle).toBeChecked()
  await svc.from('services').update({ published: false }).eq('name', nameA)
  expect(captured).not.toBeNull()
  const anon = await pwRequest.newContext({ baseURL: 'http://127.0.0.1:3100' })
  const replay = await anon.post('/admin/services', {
    headers: { 'next-action': captured!.headers['next-action'], 'content-type': captured!.headers['content-type'] },
    data: captured!.body ?? '',
    maxRedirects: 0,
  })
  // rejected either by the route guard (3xx -> login) or by requireAdmin() inside the action
  const loc = replay.headers()['location'] ?? replay.headers()['x-action-redirect'] ?? ''
  expect(replay.status() >= 300 && replay.status() < 400 || /\/admin\/login/.test(loc)).toBe(true)
  expect((await row(nameA))!.published).toBe(false)
  await anon.dispose()
  await page.reload()

  // --- reorder
  await page.goto('/admin/services')
  const before = { a: (await row(nameA))!.sort_order, b: (await row(nameB))!.sort_order }
  expect(before.a).toBeLessThan(before.b)
  await page.getByRole('button', { name: `Move ${nameB} up` }).click()
  await expect(page.getByRole('status')).toContainText(/order saved/i)
  const after = { a: (await row(nameA))!.sort_order, b: (await row(nameB))!.sort_order }
  expect(after.b).toBeLessThan(after.a)

  // --- delete with confirmation
  await page.getByRole('searchbox', { name: /search/i }).fill(tag)
  await page.getByRole('button', { name: `Delete ${nameB}` }).click()
  await page.getByRole('button', { name: 'Cancel' }).click()
  expect(await row(nameB)).not.toBeNull()
  await page.getByRole('button', { name: `Delete ${nameB}` }).click()
  await page.getByRole('button', { name: 'Confirm delete' }).click()
  await expect(page.getByRole('row', { name: new RegExp(nameB) })).toHaveCount(0)
  expect(await row(nameB)).toBeNull()

  await browser.close()
})
