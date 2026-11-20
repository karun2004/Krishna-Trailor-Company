import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readState } from './state'

const s = readState()
const svc = createClient(s.url, s.serviceKey, { auth: { persistSession: false } })

const LINKS = ['Home', 'About', 'Krishna Trailor', 'Heavy Haulage', 'Radhe Travels', 'Fleet', 'Projects', 'Contact']

test('desktop nav has all links and a quote pill', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Primary' })
  for (const l of LINKS) await expect(nav.getByRole('link', { name: l, exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Get a Quote' }).last()).toHaveAttribute('href', '/contact')
})

test('mobile drawer opens/closes with button and Esc; no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const drawer = page.getByRole('dialog', { name: 'Site menu' })
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(drawer).toBeVisible()
  for (const l of LINKS) await expect(drawer.getByRole('link', { name: l, exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Close menu' }).click()
  await expect(drawer).toHaveCount(0)
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(drawer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('footer shows head-office phone from settings', async ({ page }) => {
  const { data } = await svc.from('office_locations').select('phone').eq('is_head_office', true).eq('published', true).limit(1).single()
  expect(data?.phone).toBeTruthy()
  await page.goto('/')
  await expect(page.locator('footer')).toContainText(data!.phone as string)
})

test('reduced motion renders content visible', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const opacities = await page.evaluate(() => Array.from(document.querySelectorAll('main *')).map((e) => getComputedStyle(e).opacity))
  expect(opacities.every((o) => o === '1')).toBe(true)
  await ctx.close()
})
