import { describe, expect, it } from 'vitest'
import { resolveMedia, toMediaRef } from '../media'
import type { Db } from '../types'

const fakeDb = (rows: unknown[] = []) =>
  ({
    storage: { from: (b: string) => ({ getPublicUrl: (p: string) => ({ data: { publicUrl: `http://x/${b}/${p}` } }) }) },
    from: () => ({ select: () => ({ in: async () => ({ data: rows, error: null }) }) }),
  }) as unknown as Db

describe('media helpers', () => {
  it('builds a public ref from a row', () => {
    const ref = toMediaRef(fakeDb(), { id: '1', storage_path: 'a/b.jpg', bucket: 'media', alt: 'Alt', width: 10, height: 20 })
    expect(ref).toEqual({ url: 'http://x/media/a/b.jpg', alt: 'Alt', width: 10, height: 20, mime: null })
  })
  it('resolveMedia returns null for null id without querying', async () => {
    expect(await resolveMedia(fakeDb(), null)).toBeNull()
  })
  it('resolveMedia returns null (no throw) for a missing asset', async () => {
    expect(await resolveMedia(fakeDb([]), 'gone')).toBeNull()
  })
})
