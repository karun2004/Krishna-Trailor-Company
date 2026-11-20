import { describe, expect, it } from 'vitest'
import { FALLBACK_HEIGHT, FALLBACK_WIDTH, resolveMediaImage } from '../media-image.helpers'
import { buildFooterData } from '../footer-data'
import { isActive } from '../nav-links'
import type { Office } from '@/lib/queries/types'

describe('resolveMediaImage', () => {
  it('returns null for null/undefined/blank url', () => {
    expect(resolveMediaImage(null)).toBeNull()
    expect(resolveMediaImage(undefined)).toBeNull()
    expect(resolveMediaImage({ url: '  ', alt: 'x', width: 1, height: 1 })).toBeNull()
  })
  it('falls back for missing/invalid dimensions and alt', () => {
    expect(resolveMediaImage({ url: 'http://a/b.jpg', alt: null, width: null, height: 0 })).toEqual({
      src: 'http://a/b.jpg', alt: '', width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT,
    })
  })
  it('keeps real values', () => {
    expect(resolveMediaImage({ url: 'u', alt: ' Truck ', width: 800.4, height: 600 })).toEqual({ src: 'u', alt: 'Truck', width: 800, height: 600 })
  })
})

const office = (o: Partial<Office>): Office => ({ id: 'i', sort_order: 1, name: 'N', address: null, phone: null, email: null, is_head_office: false, map_url: null, division_id: null, ...o })

describe('buildFooterData', () => {
  it('omits empty offices, sorts head first, falls back to settings phone', () => {
    const d = buildFooterData(
      { contact: { office_phone: '0172-1', phones: [{ name: 'A', number: '99' }, { number: ' ' }], email: 'a@b.c' }, company: { name: 'KTC' } },
      [office({ name: 'Bhopal' }), office({ name: 'Other', address: 'X' }), office({ name: 'HQ', is_head_office: true, address: 'Y' })],
    )
    expect(d.offices.map((o) => o.name)).toEqual(['HQ', 'Other'])
    expect(d.offices[0].phone).toBe('0172-1')
    expect(d.phones).toEqual([{ name: 'A', number: '99' }])
    expect(d.companyName).toBe('KTC')
  })
  it('handles empty/garbage settings', () => {
    expect(buildFooterData({ contact: 'x' }, [])).toEqual({ companyName: undefined, offices: [], phones: [], email: undefined })
  })
})

describe('isActive', () => {
  it('matches home exactly and sections by prefix', () => {
    expect(isActive('/', '/')).toBe(true)
    expect(isActive('/fleet', '/')).toBe(false)
    expect(isActive('/projects/x', '/projects')).toBe(true)
  })
})
