import { describe, expect, it } from 'vitest'
import { composeMetadata } from '../seo'
import { buildLocalBusinessJsonLd, serializeJsonLd } from '../jsonld'
import type { Office, Seo } from '../queries'

const fb = { title: 'About', description: 'About us', path: '/about' }
const BASE = 'https://example.test'

describe('composeMetadata', () => {
  it('uses fallback and builds canonical from base when no seo row', () => {
    const m = composeMetadata(null, fb, BASE)
    expect(m.title).toBe('About')
    expect(m.description).toBe('About us')
    expect(m.alternates?.canonical).toBe('https://example.test/about')
    expect(m.twitter).toMatchObject({ card: 'summary' })
    expect(m.openGraph).not.toHaveProperty('images')
  })
  it('prefers seo values, absolute title when company named, and og image', () => {
    const seo: Seo = {
      page_key: 'contact', slug: '/contact', title: 'Contact | Krishna Trailor Company', meta_description: 'Desc',
      canonical_url: null, og_media: { url: 'https://img.test/a.jpg', alt: 'A', width: 1, height: 1 },
    }
    const m = composeMetadata(seo, fb, BASE)
    expect(m.title).toEqual({ absolute: 'Contact | Krishna Trailor Company' })
    expect(m.description).toBe('Desc')
    expect(m.alternates?.canonical).toBe('https://example.test/contact')
    expect(m.openGraph).toMatchObject({ images: [{ url: 'https://img.test/a.jpg', alt: 'A' }] })
    expect(m.twitter).toMatchObject({ card: 'summary_large_image' })
  })
  it('honours an explicit canonical_url and maps home to the bare origin path', () => {
    const seo = { page_key: 'x', slug: null, title: null, meta_description: null, canonical_url: 'https://c.test/x', og_media: null } as Seo
    expect(composeMetadata(seo, fb, BASE).alternates?.canonical).toBe('https://c.test/x')
    expect(composeMetadata(null, { ...fb, path: '/' }, BASE).alternates?.canonical).toBe('https://example.test/')
  })
})

describe('json-ld', () => {
  it('escapes < so content cannot close the script tag', () => {
    const out = serializeJsonLd({ name: '</script><b>' })
    expect(out).not.toContain('<')
    expect(JSON.parse(out).name).toBe('</script><b>')
  })
  it('emits only verified fields', () => {
    const settings = { company: { name: 'Krishna Trailor Company', founded: '1987' }, contact: { address: 'Shop No. 644, New Motor Market, Manimajra, Chandigarh – 160101', office_phone: '0172-4640644', phones: [{ number: '9815413468' }], email: 'a@b.test' } }
    const ld = buildLocalBusinessJsonLd(settings, [] as Office[], BASE)!
    expect(ld).toMatchObject({ '@type': 'LocalBusiness', name: 'Krishna Trailor Company', foundingDate: '1987', telephone: ['0172-4640644', '9815413468'], email: 'a@b.test' })
    expect((ld.address as { postalCode: string }).postalCode).toBe('160101')
    const bare = buildLocalBusinessJsonLd({ company: { name: 'X' } }, [], BASE)!
    expect(Object.keys(bare).sort()).toEqual(['@context', '@type', 'name', 'url'])
    expect(buildLocalBusinessJsonLd({}, [], BASE)).toBeNull()
  })
})
