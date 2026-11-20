import { chromium, expect, test, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const tag = `E2E-${crypto.randomUUID().slice(0, 8)}`

test.setTimeout(120_000)

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(s.admin.email)
  await page.getByLabel('Password').fill(s.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin$/)
}

async function newPage() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: 'http://127.0.0.1:3100' })
  await login(page)
  return { browser, page }
}

test.afterAll(async () => {
  await svc.from('office_locations').delete().like('name', `${tag}%`)
  await svc.from('seo_metadata').delete().like('page_key', `e2e-${tag.toLowerCase()}%`)
})

test('anonymous visitors are redirected from the group C screens', async ({ page }) => {
  for (const p of ['offices', 'offices/new', 'homepage', 'settings', 'seo', 'seo/new']) {
    await page.goto(`/admin/${p}`)
    await expect(page).toHaveURL(/\/admin\/login/)
  }
})

test('offices: create, edit, delete', async () => {
  const { browser, page } = await newPage()
  await page.goto('/admin/offices/new')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Name is required')).toBeVisible()
  await page.getByLabel('Name').fill(`${tag} Office`)
  await page.getByLabel('Address').fill('1 Test Road')
  await page.getByLabel('Phone').fill('0172-1234567')
  await page.getByLabel('Map URL').fill('javascript:alert(1)')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText(/http/i).first()).toBeVisible()
  await page.getByLabel('Map URL').fill('https://maps.example.com/x')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/offices$/)
  await expect(page.getByRole('row', { name: new RegExp(`${tag} Office`) })).toBeVisible()
  const r = (await svc.from('office_locations').select('*').eq('name', `${tag} Office`).maybeSingle()).data
  expect(r).toMatchObject({ address: '1 Test Road', map_url: 'https://maps.example.com/x', published: false })

  await page.goto(`/admin/offices/${r!.id}`)
  await page.getByLabel('Address').fill('2 Changed Road')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForURL(/\/admin\/offices$/)
  expect((await svc.from('office_locations').select('address').eq('id', r!.id).single()).data!.address).toBe('2 Changed Road')

  await page.getByRole('row', { name: new RegExp(`${tag} Office`) }).getByRole('button', { name: /delete/i }).click()
  await page.getByRole('dialog').getByRole('button', { name: /delete/i }).click()
  await expect(page.getByRole('row', { name: new RegExp(`${tag} Office`) })).toHaveCount(0)
  expect((await svc.from('office_locations').select('id').eq('id', r!.id)).data).toHaveLength(0)
  await browser.close()
})

test('homepage: edit a block and restore', async () => {
  const { browser, page } = await newPage()
  const orig = (await svc.from('page_content').select('*').eq('page_key', 'home').eq('block_key', 'hero').single()).data!
  try {
    await page.goto('/admin/homepage')
    await expect(page.getByText('hero', { exact: true }).first()).toBeVisible()
    await page.goto(`/admin/homepage/${orig.id}`)
    await page.getByLabel('Content', { exact: true }).fill('not json')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(/valid JSON/i)).toBeVisible()
    await page.getByLabel('Content', { exact: true }).fill(JSON.stringify({ ...orig.content, headline: `${tag} headline` }))
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForURL(/\/admin\/homepage$/)
    const after = (await svc.from('page_content').select('content').eq('id', orig.id).single()).data!
    expect(after.content.headline).toBe(`${tag} headline`)
    expect(after.content.cta_label).toBe(orig.content.cta_label)
  } finally {
    await svc.from('page_content').update({ content: orig.content, published: orig.published, media_id: orig.media_id, verification_note: orig.verification_note }).eq('id', orig.id)
    await browser.close()
  }
})

test('seo: edit and restore, create and delete', async () => {
  const { browser, page } = await newPage()
  const orig = (await svc.from('seo_metadata').select('*').eq('page_key', 'home').single()).data!
  try {
    await page.goto(`/admin/seo/${orig.id}`)
    await page.getByLabel('Title', { exact: true }).fill(`${tag} Title`)
    await page.getByLabel('Meta description').fill('E2E description')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForURL(/\/admin\/seo$/)
    const a = (await svc.from('seo_metadata').select('title, meta_description').eq('id', orig.id).single()).data!
    expect(a).toEqual({ title: `${tag} Title`, meta_description: 'E2E description' })

    const key = `e2e-${tag.toLowerCase()}`
    await page.goto('/admin/seo/new')
    await page.getByLabel('Page key').fill(key)
    await page.getByLabel('Title', { exact: true }).fill('Temp')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForURL(/\/admin\/seo$/)
    await page.getByRole('row', { name: new RegExp(key) }).getByRole('button', { name: /delete/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: /delete/i }).click()
    await expect(page.getByRole('row', { name: new RegExp(key) })).toHaveCount(0)
  } finally {
    await svc.from('seo_metadata').update({ title: orig.title, meta_description: orig.meta_description, og_media_id: orig.og_media_id, canonical_url: orig.canonical_url }).eq('id', orig.id)
    await browser.close()
  }
})

test('settings: contact details persist across reload; invalid URL rejected', async () => {
  const { browser, page } = await newPage()
  const origRows = (await svc.from('site_settings').select('key, value').in('key', ['contact', 'social'])).data ?? []
  try {
    await page.goto('/admin/settings')
    await page.getByLabel('Office phone').fill('0172-0000001')
    await page.getByLabel('Additional phones').fill('Test Person: 9999999999')
    await page.getByLabel('Email', { exact: true }).fill('e2e@example.com')
    await page.getByLabel('WhatsApp').fill('+91 98765 43210')
    await page.getByLabel('Head-office address').fill('E2E Address, Chandigarh')
    await page.getByLabel('Map URL').fill('ftp://bad.example.com')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(/http/i).first()).toBeVisible()
    await page.getByLabel('Map URL').fill('https://maps.example.com/ktc')
    await page.getByLabel('Facebook').fill('https://facebook.com/e2e')
    await page.getByLabel('Instagram').fill('https://instagram.com/e2e')
    await page.getByLabel('LinkedIn').fill('https://linkedin.com/company/e2e')
    await page.getByLabel('YouTube').fill('https://youtube.com/@e2e')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Settings saved')).toBeVisible()

    await page.reload()
    await expect(page.getByLabel('Office phone')).toHaveValue('0172-0000001')
    await expect(page.getByLabel('Additional phones')).toHaveValue('Test Person: 9999999999')
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue('e2e@example.com')
    await expect(page.getByLabel('WhatsApp')).toHaveValue('+91 98765 43210')
    await expect(page.getByLabel('Head-office address')).toHaveValue('E2E Address, Chandigarh')
    await expect(page.getByLabel('Map URL')).toHaveValue('https://maps.example.com/ktc')
    await expect(page.getByLabel('Facebook')).toHaveValue('https://facebook.com/e2e')
    await expect(page.getByLabel('YouTube')).toHaveValue('https://youtube.com/@e2e')
    const rows = (await svc.from('site_settings').select('key, value').in('key', ['contact', 'social'])).data!
    const contact = rows.find((r) => r.key === 'contact')!.value as Record<string, unknown>
    expect(contact).toMatchObject({ whatsapp: '+91 98765 43210', map_url: 'https://maps.example.com/ktc', email: 'e2e@example.com' })
  } finally {
    await svc.from('site_settings').delete().in('key', ['contact', 'social'])
    if (origRows.length) await svc.from('site_settings').insert(origRows)
    await browser.close()
  }
})
