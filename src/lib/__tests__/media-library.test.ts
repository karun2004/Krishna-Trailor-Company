import { describe, expect, it } from 'vitest'
import {
  altFromFilename, assetName, filterAssets, formatBytes, mediaPublicUrl, moveInOrder, placesLabel, sortAssets,
} from '../media-library'

const a = (id: string, o: Partial<Record<string, unknown>> = {}) => ({
  id, alt: null, caption: null, storage_path: `gallery/${id}.png`, category: 'gallery', sort_order: 0,
  created_at: '2026-01-01T00:00:00Z', ...o,
}) as never as { id: string; alt: string | null; caption: string | null; storage_path: string; category: string; sort_order: number; created_at: string }

describe('media-library helpers', () => {
  it('builds public urls', () => {
    expect(mediaPublicUrl('http://x/', 'media', 'a/b.png')).toBe('http://x/storage/v1/object/public/media/a/b.png')
  })
  it('names by alt then file', () => {
    expect(assetName({ alt: ' Crane ', storage_path: 'x/y.png' })).toBe('Crane')
    expect(assetName({ alt: null, storage_path: 'x/y.png' })).toBe('y.png')
  })
  it('sorts by sort_order then newest', () => {
    const l = sortAssets([a('1', { sort_order: 1 }), a('2', { created_at: '2026-02-01T00:00:00Z' }), a('3')])
    expect(l.map((x) => x.id)).toEqual(['2', '3', '1'])
  })
  it('filters by query and category', () => {
    const l = [a('1', { alt: 'Big Crane' }), a('2', { caption: 'crane day', category: 'cranes' }), a('3')]
    expect(filterAssets(l, { query: 'crane', category: '' }).map((x) => x.id)).toEqual(['1', '2'])
    expect(filterAssets(l, { query: 'crane', category: 'cranes' }).map((x) => x.id)).toEqual(['2'])
    expect(filterAssets(l, { query: '', category: '' })).toHaveLength(3)
  })
  it('moves within visible, preserving hidden slots', () => {
    expect(moveInOrder(['a', 'b', 'c', 'd'], ['a', 'c', 'd'], 'a', 1)).toEqual(['c', 'b', 'a', 'd'])
    expect(moveInOrder(['a', 'b'], ['a', 'b'], 'a', -1)).toEqual(['a', 'b'])
    expect(moveInOrder(['a', 'b'], ['a', 'b'], 'zz', 1)).toEqual(['a', 'b'])
  })
  it('formats sizes, places and alt', () => {
    expect(formatBytes(null)).toBe('unknown size')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(3 * 1048576)).toBe('3.0 MB')
    expect(placesLabel(1)).toBe('1 place')
    expect(placesLabel(2)).toBe('2 places')
    expect(altFromFilename('my_photo.final.png')).toBe('my photo.final')
  })
})
