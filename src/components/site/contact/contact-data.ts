import type { Office } from '@/lib/queries/types'
import { buildFooterData, type FooterOffice } from '../footer-data'

export type ContactPanelData = {
  offices: FooterOffice[]
  phones: { name?: string; number: string }[]
  email?: string
  whatsappUrl?: string
}

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})

/** Digits for tel: links (keeps a leading +). */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** wa.me link from an Indian mobile or full international number; undefined when not derivable. */
export function whatsappUrl(number: string | undefined): string | undefined {
  if (!number) return undefined
  const d = number.replace(/\D/g, '')
  if (/^[6-9]\d{9}$/.test(d)) return `https://wa.me/91${d}`
  if (/^91[6-9]\d{9}$/.test(d)) return `https://wa.me/${d}`
  return undefined
}

/** Pure: shapes settings + offices for the contact side panel. Renders only what exists. */
export function buildContactData(settings: Record<string, unknown>, offices: Office[]): ContactPanelData {
  const f = buildFooterData(settings, offices)
  const contact = obj(settings.contact)
  // Explicit settings.contact.whatsapp wins; otherwise the first listed mobile number.
  const wa = whatsappUrl(str(contact.whatsapp)) ?? f.phones.map((p) => whatsappUrl(p.number)).find(Boolean)
  const settingsAddress = str(contact.address)
  const list = [...f.offices]
  // Head office address falls back to settings.contact.address.
  const head = list.find((o) => o.isHead)
  if (settingsAddress && head && !head.address) head.address = settingsAddress
  return { offices: list, phones: f.phones, email: f.email, whatsappUrl: wa }
}
