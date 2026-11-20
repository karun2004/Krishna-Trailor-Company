import { expect, test, type Page } from '@playwright/test'

async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y <= h; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(60)
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(1500)
}

const stuckHidden = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('main *')).filter((e) => {
      const cs = getComputedStyle(e)
      return cs.visibility === 'hidden' || (cs.opacity === '0' && e.closest('[data-hero-scrub]') === null && !(e as HTMLElement).hasAttribute('data-pulse'))
    }).length,
  )

test('reduced motion: everything visible, no pin spacer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForTimeout(800)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  expect(await stuckHidden(page)).toBe(0)
  await expect(page.locator('#services li').last()).toBeVisible()
})

test('motion enabled: content visible after scrolling through', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await page.waitForTimeout(800)
  await scrollThrough(page)
  expect(await stuckHidden(page)).toBe(0)
  expect(errors).toEqual([])
})

test('division page content visible after scroll', async ({ page }) => {
  await page.goto('/heavy-haulage')
  await page.waitForTimeout(500)
  await scrollThrough(page)
  expect(await stuckHidden(page)).toBe(0)
})

for (const width of [1440, 390]) {
  test(`homepage CLS < 0.1 at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await page.addInitScript(() => {
      ;(window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('/')
    await page.waitForTimeout(1500)
    await scrollThrough(page)
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    expect(cls).toBeLessThan(0.1)
  })
}
