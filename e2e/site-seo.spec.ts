import { expect, test } from '@playwright/test'

const PAGES = ['/', '/about', '/krishna-trailor', '/heavy-haulage', '/radhe-travels', '/fleet', '/projects', '/contact']

test('robots.txt disallows admin/api and points at the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text()
  expect(body).toMatch(/Disallow: \/admin/)
  expect(body).toMatch(/Disallow: \/api/)
  expect(body).toMatch(/Sitemap: .+\/sitemap\.xml/)
})

test('sitemap.xml lists public pages only', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text()
  for (const p of PAGES.filter((p) => p !== '/')) expect(body).toContain(`${p}</loc>`)
  expect(body).not.toContain('/admin')
  expect(body).not.toContain('/api')
})

test('every public page has unique title, description and canonical', async ({ page }) => {
  const titles = new Set<string>()
  for (const p of PAGES) {
    await page.goto(p)
    const title = await page.title()
    expect(title, p).toBeTruthy()
    titles.add(title)
    await expect(page.locator('meta[name="description"]'), p).toHaveAttribute('content', /.+/)
    await expect(page.locator('link[rel="canonical"]'), p).toHaveAttribute('href', /^https?:\/\/.+/)
  }
  expect(titles.size).toBe(PAGES.length)
})

test('home has one valid LocalBusiness JSON-LD block', async ({ page }) => {
  await page.goto('/')
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(blocks).toHaveLength(1)
  const json = JSON.parse(blocks[0])
  expect(json['@type']).toBe('LocalBusiness')
  expect(json.name).toBe('Krishna Trailor Company')
})

test('admin is noindex', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})
