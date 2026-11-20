import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { SettingsForm, type SettingsState } from './SettingsForm'

const str = (v: unknown) => (typeof v === 'string' ? v : '')

export default async function SettingsPage() {
  await requireAdmin()
  const db = await createServerClient()
  const { data, error } = await db.from('site_settings').select('key, value').in('key', ['contact', 'social'])
  if (error) throw new Error('Failed to load settings')
  const get = (k: string) => ((data ?? []).find((r) => r.key === k)?.value ?? {}) as Record<string, unknown>
  const c = get('contact')
  const s = get('social')
  const phones = Array.isArray(c.phones)
    ? (c.phones as { name?: unknown; number?: unknown }[]).map((p) => (str(p.name) ? `${str(p.name)}: ${str(p.number)}` : str(p.number))).join('\n')
    : ''
  const initial: SettingsState = {
    office_phone: str(c.office_phone),
    phones,
    email: str(c.email),
    whatsapp: str(c.whatsapp),
    address: str(c.address),
    map_url: str(c.map_url),
    facebook: str(s.facebook),
    instagram: str(s.instagram),
    linkedin: str(s.linkedin),
    youtube: str(s.youtube),
    twitter: str(s.twitter),
  }
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Settings</h1>
      <SettingsForm initial={initial} />
    </main>
  )
}
