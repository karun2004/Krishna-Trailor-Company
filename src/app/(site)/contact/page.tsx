import { CustomSections } from '@/components/site/CustomSections'
import { PageHero, SectionShell } from '@/components/site'
import { ContactForms } from '@/components/site/contact/ContactForms'
import { ContactPanel } from '@/components/site/contact/ContactPanel'
import { buildContactData } from '@/components/site/contact/contact-data'
import { JsonLd } from '@/components/site/JsonLd'
import { buildLocalBusinessJsonLd } from '@/lib/jsonld'
import { getOffices, getSiteSettings } from '@/lib/queries/content'
import { buildMetadata, siteUrl } from '@/lib/seo'
import { getSlots } from '@/lib/queries/slots'

export const generateMetadata = () =>
  buildMetadata('contact', { title: 'Contact', description: 'Contact Krishna Trailor Company at Manimajra, Chandigarh for a quote.', path: '/contact' })

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const t = Array.isArray(sp.type) ? sp.type[0] : sp.type
  const initialType = t === 'travel' ? 'travel' : 'industrial'
  const slot = await getSlots('contact')
  const [settings, offices] = await Promise.all([getSiteSettings(), getOffices()])
  const data = buildContactData(settings, offices)

  return (
    <>
      <JsonLd data={buildLocalBusinessJsonLd(settings, offices, siteUrl())} />
      <PageHero label="Contact" title="Get a quote" media={slot('hero')} lead="Tell us about your load or your journey. We reply during office hours." />
      <CustomSections page="contact" placement="top" />
      <SectionShell variant="white">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ContactForms initialType={initialType} />
          <ContactPanel data={data} />
        </div>
      </SectionShell>
      <CustomSections page="contact" placement="bottom" />
    </>
  )
}
