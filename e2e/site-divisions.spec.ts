import { expect, test } from '@playwright/test'

const PAGES = [
  { path: '/krishna-trailor', theme: 'krishna' },
  { path: '/heavy-haulage', theme: 'haulage' },
  { path: '/radhe-travels', theme: 'radhe' },
]

for (const { path, theme } of PAGES) {
  test(`${path}: loads, one h1, theme, no overflow, no draft claims`, async ({ page }) => {
    for (const w of [390, 1440]) {
      await page.setViewportSize({ width: w, height: 900 })
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      await expect(page.locator(`main [data-division="${theme}"]`)).toHaveCount(1)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    }
    const html = await page.content()
    expect(html).not.toContain('38+ years')
    expect(html).not.toContain('250 MT')
  })
}

test('heavy haulage shows the 7-step process', async ({ page }) => {
  await page.goto('/heavy-haulage')
  await expect(page.getByRole('list').filter({ hasText: 'Post-delivery sign-off' }).locator('li')).toHaveCount(7)
})

test('radhe travels has no orange elements and CTA targets travel enquiry', async ({ page }) => {
  await page.goto('/radhe-travels')
  const cta = page.locator('main a[href="/contact?type=travel"]').first()
  await expect(cta).toBeVisible()
  const orange = await page.evaluate(() => {
    const isOrange = (c: string) => {
      const m = c.match(/\d+(\.\d+)?/g)?.map(Number)
      if (!m || m.length < 3 || (m.length > 3 && m[3] === 0)) return false
      const [r, g, b] = m
      return r > 200 && g > 100 && g < 190 && b < 90
    }
    return Array.from(document.querySelectorAll('[data-division="radhe"], [data-division="radhe"] *')).filter((e) => {
      const s = getComputedStyle(e)
      return [s.color, s.backgroundColor, s.borderTopColor].some(isOrange)
    }).length
  })
  expect(orange).toBe(0)
})

test('industrial divisions link to industrial enquiry', async ({ page }) => {
  for (const p of ['/krishna-trailor', '/heavy-haulage']) {
    await page.goto(p)
    await expect(page.locator('main a[href="/contact?type=industrial"]').first()).toBeVisible()
  }
})
