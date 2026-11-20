import { describe, expect, it } from 'vitest'
import { MAX_UPLOAD_BYTES, MEDIA_CATEGORIES, uploadSchema, validateFile } from '../media'

describe('validateFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])('accepts %s', (m) => {
    expect(validateFile(m, 1000)).toEqual({ ok: true })
  })
  it('accepts exactly 10MB', () => {
    expect(validateFile('image/png', MAX_UPLOAD_BYTES).ok).toBe(true)
  })
  it.each(['image/svg+xml', 'application/pdf', 'image/gif', ''])('rejects %j with a reason', (m) => {
    const r = validateFile(m, 1000)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/not allowed/i)
  })
  it('rejects 11MB with a size reason', () => {
    const r = validateFile('image/jpeg', 11 * 1024 * 1024)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/10MB/)
  })
  it('rejects empty files', () => {
    expect(validateFile('image/png', 0).ok).toBe(false)
  })
})

describe('uploadSchema', () => {
  it('accepts a valid category with optional alt/caption', () => {
    expect(uploadSchema.safeParse({ category: 'fleet' }).success).toBe(true)
    expect(uploadSchema.safeParse({ category: 'gallery', alt: 'a', caption: 'b' }).success).toBe(true)
  })
  it('rejects unknown category', () => {
    expect(uploadSchema.safeParse({ category: 'nope' }).success).toBe(false)
  })
  it('lists the 15 db categories', () => {
    expect(MEDIA_CATEGORIES).toHaveLength(15)
  })
})
