import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'

const css = readFileSync('src/app/globals.css', 'utf8')

it.each([
  ['--color-black', '#101010'],
  ['--color-white', '#FFFFFF'],
  ['--color-soft', '#F5F6F7'],
  ['--color-orange', '#F28C28'],
  ['--color-blue', '#DCEBFF'],
  ['--color-navy', '#14243A'],
])('defines %s as %s', (name, value) => {
  expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, 'i'))
})
