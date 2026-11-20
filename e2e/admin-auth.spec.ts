import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readState } from './state'

const NAME = 'e2e-should-not-exist'

async function serviceRowCount() {
  const s = readState()
  const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
  const { count, error } = await svc
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('name', NAME)
  if (error) throw error
  return count ?? 0
}

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

test('logged-out /admin redirects to /admin/login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('no-cookie POST /api/admin/services returns 401 and creates no row', async ({ request }) => {
  const res = await request.post('/api/admin/services', { data: { name: NAME } })
  expect(res.status()).toBe(401)
  expect(await res.json()).toEqual({ error: 'Unauthorized' })
  expect(await serviceRowCount()).toBe(0)
})

test('logged-in admin reaches /admin', async ({ page }) => {
  const s = readState()
  await login(page, s.admin.email, s.admin.password)
  await expect(page).toHaveURL(/\/admin$/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin$/)
})

test('authenticated non-admin is rejected from /admin and the API', async ({ page }) => {
  const s = readState()
  await login(page, s.nonAdmin.email, s.nonAdmin.password)
  await expect(page).toHaveURL(/\/admin\/login/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
  // even holding a valid (non-admin) session cookie, the API refuses.
  const res = await page.request.post('/api/admin/services', { data: { name: NAME } })
  expect(res.status()).toBe(401)
  expect(await serviceRowCount()).toBe(0)
})
