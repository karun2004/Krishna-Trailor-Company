import type { Metadata } from 'next'
import { GhostHeadline, MonoLabel, SectionShell } from '@/components/site'
import { ContactForms } from '@/components/site/contact/ContactForms'
import { ContactPanel } from '@/components/site/contact/ContactPanel'
import { buildContactData } from '@/components/site/contact/contact-data'
import { getOffices, getSeo, getSiteSettings } from '@/lib/queries/content'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('contact')
  return {
    title: seo?.title ?? 'Contact | Krishna Trailor Company',
    ...(seo?.meta_description ? { description: seo.meta_description } : {}),
    ...(seo?.canonical_url ? { alternates: { canonical: seo.canonical_url } } : {}),
  }
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const t = Array.isArray(sp.type) ? sp.type[0] : sp.type
  const initialType = t === 'travel' ? 'travel' : 'industrial'
  const [settings, offices] = await Promise.all([getSiteSettings(), getOffices()])
  const data = buildContactData(settings, offices)

  return (
    <>
      <SectionShell variant="black">
        <MonoLabel index={1}>Contact</MonoLabel>
        <GhostHeadline as="h1" on="dark" className="mt-6">Get a quote</GhostHeadline>
      </SectionShell>
      <SectionShell variant="white">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ContactForms initialType={initialType} />
          <ContactPanel data={data} />
        </div>
      </SectionShell>
    </>
  )
}
