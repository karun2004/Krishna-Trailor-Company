import { expect, test, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readState } from './state'

async function login(page: Page) {
  const s = readState()
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(s.admin.email)
  await page.getByLabel('Password').fill(s.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

async function count(table: string) {
  const s = readState()
  const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
  const { count, error } = await svc.from(table).select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

test('dashboard counts match the database', async ({ page }) => {
  await login(page)
  const expected = {
    images: await count('media_assets'),
    projects: await count('projects'),
    equipment: await count('fleet_items'),
    services: await count('services'),
    enquiries: await count('enquiries'),
  }
  for (const [key, n] of Object.entries(expected)) {
    await expect(page.getByTestId(`stat-${key}`)).toHaveText(String(n))
  }
  await expect(page.getByRole('heading', { name: 'Recent uploads' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recent enquiries' })).toBeVisible()
})

test('desktop sidebar lists every admin section and sign-out works', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await login(page)
  const nav = page.getByRole('navigation', { name: 'Admin sections' })
  for (const label of [
    'Dashboard', 'Media', 'Divisions', 'Services', 'Fleet', 'Projects', 'Gallery', 'Timeline',
    'Testimonials', 'FAQs', 'Clients', 'Offices', 'Homepage', 'Settings', 'SEO', 'Enquiries',
  ]) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible()
  }
  await page.getByRole('button', { name: /sign out/i }).click()
  await expect(page).toHaveURL(/\/admin\/login/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('mobile sidebar is a drawer toggled by button and closed by Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await login(page)
  const toggle = page.getByRole('button', { name: /navigation menu/i })
  const nav = page.getByRole('navigation', { name: 'Admin sections' })
  await expect(nav).toBeHidden()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(nav).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(nav).toBeHidden()
  await expect(toggle).toBeFocused()
})
