import type { Office } from '@/lib/queries/types'

export type FooterOffice = { name: string; address?: string; phone?: string; email?: string; mapUrl?: string; isHead: boolean }
export type FooterData = {
  companyName?: string
  offices: FooterOffice[]
  phones: { name?: string; number: string }[]
  email?: string
}

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})

/** Pure: shapes site_settings + offices into what the footer renders. Only includes what actually exists. */
export function buildFooterData(settings: Record<string, unknown>, offices: Office[]): FooterData {
  const contact = obj(settings.contact)
  const company = obj(settings.company)
  const list: FooterOffice[] = offices
    .map((o) => ({ name: o.name, address: str(o.address), phone: str(o.phone), email: str(o.email), mapUrl: str(o.map_url), isHead: o.is_head_office }))
    .filter((o) => o.address || o.phone || o.email)
    .sort((a, b) => Number(b.isHead) - Number(a.isHead))

  // Head office phone falls back to the settings office_phone when the office row has none.
  const settingsPhone = str(contact.office_phone)
  const head = list.find((o) => o.isHead)
  if (settingsPhone && head && !head.phone) head.phone = settingsPhone

  const phones = Array.isArray(contact.phones)
    ? contact.phones.flatMap((p) => {
        const n = str(obj(p).number)
        return n ? [{ name: str(obj(p).name), number: n }] : []
      })
    : []
  return { companyName: str(company.name), offices: list, phones, email: str(contact.email) }
}
