import { expect, test } from '@playwright/test'

test('homepage: h1, 8 services, no testimonials heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ANY LOAD')
  await expect(page.locator('#services li')).toHaveCount(8)
  await expect(page.locator('#services li').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /testimonials|client words/i })).toHaveCount(0)
  await expect(page.getByText(/38\+|250 MT/)).toHaveCount(0)
})

test('FAQ accordion toggles via keyboard', async ({ page }) => {
  await page.goto('/')
  const btn = page.locator('main button[aria-expanded]').first()
  await btn.scrollIntoViewIfNeeded()
  await btn.focus()
  await expect(btn).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Enter')
  await expect(btn).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('region', { name: await btn.innerText().then((t) => t.replace(/[+−]/, '').trim()) })).toBeVisible()
  await page.keyboard.press('Space')
  await expect(btn).toHaveAttribute('aria-expanded', 'false')
})

for (const width of [390, 1440]) {
  test(`no horizontal overflow at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('reduced motion keeps content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#services li').last()).toBeVisible()
  const opacity = await page.locator('#services li').last().evaluate((e) => getComputedStyle(e).opacity)
  expect(opacity).toBe('1')
})
