import type { Office } from '@/lib/queries'

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})

/** JSON for a <script type="application/ld+json">: '<' (and line separators) escaped so content cannot close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16)}`)
}

/** LocalBusiness JSON-LD from verified settings/offices only; unknown fields are omitted. */
export function buildLocalBusinessJsonLd(
  settings: Record<string, unknown>, offices: Office[], siteUrl: string,
): Record<string, unknown> | null {
  const company = obj(settings.company)
  const contact = obj(settings.contact)
  const name = str(company.name)
  if (!name) return null
  const head = offices.find((o) => o.is_head_office)
  const addr = str(head?.address) ?? str(contact.address)
  const phones = [
    str(contact.office_phone),
    ...(Array.isArray(contact.phones) ? contact.phones.map((p) => str(obj(p).number)) : []),
    str(head?.phone),
  ].filter((p, i, a): p is string => !!p && a.indexOf(p) === i)
  const email = str(contact.email) ?? str(head?.email)
  const founded = str(company.founded)
  const postal = addr?.match(/\b(\d{6})\b/)?.[1]
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    url: siteUrl,
    ...(addr ? { address: { '@type': 'PostalAddress', streetAddress: addr, ...(postal ? { postalCode: postal } : {}), addressCountry: 'IN' } } : {}),
    ...(phones.length ? { telephone: phones } : {}),
    ...(email ? { email } : {}),
    ...(founded && /^\d{4}$/.test(founded) ? { foundingDate: founded } : {}),
  }
}
