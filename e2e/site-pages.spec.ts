import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const TAG = `e2e-m9-${Date.now()}`
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const ids = { media: [] as string[], project: '' }

test.beforeAll(async () => {
  for (const n of ['a', 'b']) {
    const path = `${TAG}-${n}.png`
    const up = await svc.storage.from('media').upload(path, PNG, { contentType: 'image/png' })
    expect(up.error).toBeNull()
    const { data, error } = await svc.from('media_assets')
      .insert({ storage_path: path, bucket: 'media', alt: `Fixture ${n}`, category: 'projects', mime_type: 'image/png', width: 1, height: 1 })
      .select('id').single()
    expect(error).toBeNull()
    ids.media.push(data!.id)
  }
  const { data: p, error } = await svc.from('projects')
    .insert({ title: `Fixture Project ${TAG}`, slug: TAG, location: 'Test City', published: true, featured_media_id: ids.media[0] })
    .select('id').single()
  expect(error).toBeNull()
  ids.project = p!.id
  const r = await svc.from('project_images').insert([
    { project_id: ids.project, media_id: ids.media[0], phase: 'before', sort_order: 1 },
    { project_id: ids.project, media_id: ids.media[1], phase: 'after', sort_order: 2 },
  ])
  expect(r.error).toBeNull()
})

test.afterAll(async () => {
  await svc.from('projects').delete().eq('id', ids.project)
  await svc.from('media_assets').delete().in('id', ids.media)
  await svc.storage.from('media').remove([`${TAG}-a.png`, `${TAG}-b.png`])
})

for (const path of ['/about', '/fleet', '/projects']) {
  for (const w of [390, 1440]) {
    test(`${path} loads with one h1 and no overflow at ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 })
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
}

test('about shows verified founding fact', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByText('founded in 1987 under Mr. Kuldeep Singh').first()).toBeVisible()
})

test('fleet category filter works', async ({ page }) => {
  await page.goto('/fleet')
  const all = await page.locator('main ul > li').count()
  expect(all).toBeGreaterThan(1)
  await page.getByRole('navigation', { name: 'Fleet categories' }).getByRole('link', { name: 'Forklifts' }).click()
  await expect(page).toHaveURL(/category=forklifts/)
  await expect(page.locator('main ul > li')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 3, name: 'Forklifts' })).toBeVisible()
})

test('projects lightbox opens, navigates and closes by keyboard with focus return', async ({ page }) => {
  await page.goto('/projects')
  const trigger = page.getByRole('button', { name: `View Fixture Project ${TAG}` })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dlg = page.getByRole('dialog', { name: `Fixture Project ${TAG}` })
  await expect(dlg).toBeVisible()
  await expect(dlg.getByRole('tab', { name: 'before' })).toHaveAttribute('aria-selected', 'true')
  await dlg.getByRole('tab', { name: 'after' }).click()
  await expect(dlg.getByRole('tab', { name: 'after' })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Escape')
  await expect(dlg).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
