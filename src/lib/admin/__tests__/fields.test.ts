import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { coerceValues, fieldErrors, matchesQuery, moveItem, slugify, toFormState, type Field } from '../fields'
import { intField, optionalText, requiredText, slugSchema, uuidOrNull } from '../schema'

const fields: Field[] = [
  { type: 'text', name: 'name', label: 'Name' },
  { type: 'number', name: 'qty', label: 'Qty' },
  { type: 'boolean', name: 'on', label: 'On' },
  { type: 'select', name: 'div', label: 'Div', options: [] },
  { type: 'media', name: 'img', label: 'Img' },
]

describe('slugify', () => {
  it('lowercases, strips accents and collapses separators', () => {
    expect(slugify('  Heavy  Haulage & Cranes! ')).toBe('heavy-haulage-cranes')
    expect(slugify('Café Ünïcode')).toBe('cafe-unicode')
    expect(slugify('---')).toBe('')
  })
})

describe('form state', () => {
  it('maps nulls to empty strings and back to null for select/media/number', () => {
    const state = toFormState(fields, { name: 'A', qty: null, on: true, div: null, img: null })
    expect(state).toEqual({ name: 'A', qty: '', on: true, div: '', img: '' })
    expect(coerceValues(fields, state)).toEqual({ name: 'A', qty: null, on: true, div: null, img: null })
    expect(coerceValues(fields, { ...state, qty: '7' }).qty).toBe(7)
  })
})

describe('moveItem', () => {
  it('swaps within bounds and is a no-op outside', () => {
    expect(moveItem([1, 2, 3], 1, -1)).toEqual([2, 1, 3])
    expect(moveItem([1, 2, 3], 1, 1)).toEqual([1, 3, 2])
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3])
    expect(moveItem([1, 2, 3], 2, 1)).toEqual([1, 2, 3])
  })
  it('does not mutate its input', () => {
    const a = [1, 2]
    moveItem(a, 0, 1)
    expect(a).toEqual([1, 2])
  })
})

describe('matchesQuery', () => {
  it('is case-insensitive across keys; empty matches all', () => {
    const r = { name: 'Crane Hire', slug: 'crane-hire', n: null }
    expect(matchesQuery(r, ['name', 'n'], 'CRANE')).toBe(true)
    expect(matchesQuery(r, ['name'], 'hire')).toBe(true)
    expect(matchesQuery(r, ['n'], 'x')).toBe(false)
    expect(matchesQuery(r, ['name'], '  ')).toBe(true)
  })
})

describe('schema helpers + fieldErrors', () => {
  const schema = z.object({ name: requiredText('Name'), slug: slugSchema, note: optionalText(5), fk: uuidOrNull, n: intField(0, 10) })
  it('reports the first message per field', () => {
    const r = schema.safeParse({ name: ' ', slug: 'Bad Slug', note: 'toolong', fk: 'x', n: null })
    expect(r.success).toBe(false)
    if (!r.success) {
      const e = fieldErrors(r.error)
      expect(e.name).toBe('Name is required')
      expect(e.slug).toMatch(/lowercase/)
      expect(e.note).toBeDefined()
      expect(e.fk).toBeDefined()
      expect(e.n).toBe('Enter a number')
    }
  })
  it('normalises empties to null and strips unknown keys', () => {
    const r = schema.parse({ name: ' A ', slug: 'a-b', note: '', fk: null, n: 3, evil: 'x' })
    expect(r).toEqual({ name: 'A', slug: 'a-b', note: null, fk: null, n: 3 })
  })
})
