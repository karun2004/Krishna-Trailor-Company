import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const ROUTES = ['/', '/about', '/krishna-trailor', '/heavy-haulage', '/radhe-travels', '/fleet', '/projects', '/contact']
const WIDTHS = [390, 768, 1024, 1440]

async function settle(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

for (const path of ROUTES) {
  test.describe(`QA ${path}`, () => {
    for (const w of WIDTHS) {
      test(`structure at ${w}px`, async ({ page }) => {
        const errors: string[] = []
        page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
        page.on('pageerror', (e) => errors.push(String(e)))
        await page.setViewportSize({ width: w, height: 900 })
        await settle(page, path)

        const overflow = await page.evaluate(() => ({
          sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        }))
        expect(overflow.sw, 'horizontal overflow').toBeLessThanOrEqual(overflow.cw)

        await expect(page.locator('h1')).toHaveCount(1)
        for (const sel of ['header', 'nav', 'main', 'footer']) {
          expect(await page.locator(sel).count(), sel).toBeGreaterThan(0)
        }

        const noAlt = await page.evaluate(() => Array.from(document.images).filter((i) => !i.hasAttribute('alt')).length)
        expect(noAlt).toBe(0)

        const unnamed = await page.evaluate(() => {
          const out: string[] = []
          for (const el of Array.from(document.querySelectorAll<HTMLElement>('a[href],button'))) {
            const name = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent || el.querySelector('img')?.getAttribute('alt') || el.getAttribute('title') || '').trim()
            if (!name) out.push(el.outerHTML.slice(0, 120))
          }
          return out
        })
        expect(unnamed).toEqual([])
        expect(errors).toEqual([])
      })
    }

    for (const w of [390, 1440]) {
      test(`axe wcag2a/aa at ${w}px`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 })
        await settle(page, path)
        // Trigger scroll reveals and let GSAP finish so axe never samples a mid-fade colour.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) }
          window.scrollTo(0, 0)
        })
        await page.waitForTimeout(1500)
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
        const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
        expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' ' + ((n.any[0]?.data as { fgColor?: string; bgColor?: string } | undefined)?.fgColor ?? '') + '/' + ((n.any[0]?.data as { bgColor?: string } | undefined)?.bgColor ?? '')).join(' | ')}`)).toEqual([])
      })
    }

    test('reduced motion: page usable', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 1024, height: 800 })
      await settle(page, path)
      await expect(page.locator('h1')).toBeVisible()
      const hidden = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('main h1, main h2, main p'))
          .filter((e) => getComputedStyle(e).opacity === '0' && e.textContent?.trim()).length)
      expect(hidden).toBe(0)
    })
  })
}

test('keyboard: skip link first, visible on focus, nav reachable, focus indicator', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await settle(page, '/about')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  const box = await skip.boundingBox()
  expect(box && box.width > 20 && box.height > 20).toBeTruthy()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
  await page.goto('/about')
  await page.keyboard.press('Tab') // skip
  await page.keyboard.press('Tab') // logo
  await page.keyboard.press('Tab') // first nav link
  const nav = page.getByRole('navigation', { name: 'Primary' })
  await expect(nav.getByRole('link', { name: 'Home', exact: true })).toBeFocused()
  const ind = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement as Element)
    return { w: parseFloat(s.outlineWidth), style: s.outlineStyle, shadow: s.boxShadow }
  })
  expect((ind.style !== 'none' && ind.w > 0) || ind.shadow !== 'none').toBeTruthy()
})

test('mobile tap targets >= 44px in nav', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await settle(page, '/')
  const toggle = await page.getByRole('button', { name: 'Open menu' }).boundingBox()
  expect(toggle!.width).toBeGreaterThanOrEqual(44)
  expect(toggle!.height).toBeGreaterThanOrEqual(44)
  const cta = await page.getByRole('link', { name: 'Get a Quote' }).last().boundingBox()
  expect(cta!.height).toBeGreaterThanOrEqual(44)
  await page.getByRole('button', { name: 'Open menu' }).click()
  const links = page.getByRole('dialog', { name: 'Site menu' }).getByRole('link')
  for (let i = 0; i < (await links.count()); i++) {
    const b = await links.nth(i).boundingBox()
    expect(b!.height).toBeGreaterThanOrEqual(44)
  }
})
