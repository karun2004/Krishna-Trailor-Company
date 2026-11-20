import { chromium, expect, test, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })
const tag = `E2E-${crypto.randomUUID().slice(0, 8)}`

test.setTimeout(120_000)

type Screen = {
  path: string
  table: string
  labelCol: string
  fill: Array<[string, string]>
  select?: [string, string]
  editField: [string, string, string] // label, column, new value
}

const screens: Screen[] = [
  { path: 'divisions', table: 'business_divisions', labelCol: 'name', fill: [['Name', `${tag} Div`], ['Tagline', 'Tag']], editField: ['Tagline', 'tagline', 'Edited tag'] },
  { path: 'fleet', table: 'fleet_items', labelCol: 'name', fill: [['Name', `${tag} Fleet`]], select: ['Category', 'cranes'], editField: ['Capacity', 'capacity', '50 t'] },
  { path: 'timeline', table: 'timeline_milestones', labelCol: 'title', fill: [['Year', '1999'], ['Title', `${tag} Mile`]], editField: ['Description', 'description', 'Edited desc'] },
  { path: 'faqs', table: 'faqs', labelCol: 'question', fill: [['Question', `${tag} Q?`], ['Answer', 'An answer']], editField: ['Answer', 'answer', 'Edited answer'] },
]

test.afterAll(async () => {
  for (const sc of screens) await svc.from(sc.table).delete().like(sc.labelCol, `${tag}%`)
})

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(s.admin.email)
  await page.getByLabel('Password').fill(s.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin$/)
}

for (const sc of screens) {
  test(`admin ${sc.path}: create, edit, publish toggle, delete`, async () => {
    const browser = await chromium.launch()
    const page = await browser.newPage({ baseURL: 'http://127.0.0.1:3100' })
    await login(page)
    const label = sc.fill.find(([l]) => l.toLowerCase() === sc.labelCol || (sc.labelCol === 'name' && l === 'Name'))?.[1] ?? sc.fill[0]![1]
    const row = async () => (await svc.from(sc.table).select('*').eq(sc.labelCol, label).maybeSingle()).data

    await page.goto(`/admin/${sc.path}/new`)
    for (const [l, v] of sc.fill) await page.getByLabel(l, { exact: true }).fill(v)
    if (sc.select) await page.getByLabel(sc.select[0], { exact: true }).selectOption(sc.select[1])
    await expect(page.getByLabel('Verification note')).toBeVisible()
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForURL(new RegExp(`/admin/${sc.path}$`))
    await expect(page.getByRole('row', { name: new RegExp(label.replace('?', '\\?')) })).toBeVisible()
    expect(await row()).toMatchObject({ published: false, verification_note: null })

    await page.getByRole('link', { name: `Edit ${label}` }).click()
    await page.waitForURL(new RegExp(`/admin/${sc.path}/[0-9a-f-]{36}$`))
    await page.getByLabel(sc.editField[0], { exact: true }).fill(sc.editField[2])
    await page.getByLabel('Verification note').fill('Confirm with owner')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForURL(new RegExp(`/admin/${sc.path}$`))
    expect(await row()).toMatchObject({ [sc.editField[1]]: sc.editField[2], verification_note: 'Confirm with owner' })

    const toggle = page.getByRole('switch', { name: `Publish ${label}` })
    await toggle.click()
    await expect(toggle).toBeChecked()
    expect((await row())!.published).toBe(true)
    await toggle.click()
    await expect(toggle).not.toBeChecked()
    expect((await row())!.published).toBe(false)

    await page.getByRole('button', { name: `Delete ${label}` }).click()
    await page.getByRole('button', { name: 'Confirm delete' }).click()
    await expect(page.getByRole('row', { name: new RegExp(label.replace('?', '\\?')) })).toHaveCount(0)
    expect(await row()).toBeNull()
    await browser.close()
  })
}
