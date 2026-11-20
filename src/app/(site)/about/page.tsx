import { GhostHeadline, MediaImage, MonoLabel, Reveal, SectionShell } from '@/components/site'
import { ClientLogosStrip } from '@/components/site/pages/ClientLogosStrip'
import { CtaBlock } from '@/components/site/pages/CtaBlock'
import { pageMetadata } from '@/components/site/pages/seo'
import { getOffices, getTimeline } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const generateMetadata = () => pageMetadata('about', 'About Krishna Trailor Company')

export default async function AboutPage() {
  const [timeline, offices] = await Promise.all([getTimeline(), getOffices()])
  const head = offices.find((o) => o.is_head_office)
  const others = offices.filter((o) => !o.is_head_office)
  return (
    <>
      <SectionShell variant="black">
        <MonoLabel index={1}>About</MonoLabel>
        <GhostHeadline as="h1" on="dark" className="mt-6">About KTC</GhostHeadline>
        <p className="mt-8 max-w-2xl text-lg text-white/80">
          Krishna Trailor Company was founded in 1987 under Mr. Kuldeep Singh, with its head office in Chandigarh
          {others.some((o) => /bhopal/i.test(o.name)) ? ' and a parallel office in Bhopal' : ''}.
        </p>
      </SectionShell>

      {timeline.length > 0 && (
        <SectionShell variant="white" labelledBy="timeline-h">
          <MonoLabel index={2}>Our journey</MonoLabel>
          <h2 id="timeline-h" className="mt-4 font-display text-3xl font-semibold uppercase tracking-tight md:text-5xl">Timeline</h2>
          <ol className="mt-10 space-y-8 border-l border-black/15 pl-6">
            {timeline.map((m) => (
              <li key={m.id}>
                <Reveal as="div">
                  <p className="font-mono text-sm uppercase tracking-wider text-orange">{m.year}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold uppercase">{m.title}</h3>
                  {m.description && <p className="mt-2 max-w-2xl text-black/70">{m.description}</p>}
                  {m.media && <MediaImage media={m.media} aspect="16/9" sizes="(min-width:768px) 600px, 100vw" className="mt-4 max-w-xl rounded-xl" />}
                </Reveal>
              </li>
            ))}
          </ol>
        </SectionShell>
      )}

      {(head || others.length > 0) && (
        <SectionShell variant="soft" labelledBy="offices-h">
          <MonoLabel index={3}>Offices</MonoLabel>
          <h2 id="offices-h" className="mt-4 font-display text-3xl font-semibold uppercase tracking-tight md:text-5xl">Where to find us</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {[...(head ? [head] : []), ...others].map((o) => (
              <li key={o.id} className="rounded-2xl bg-white p-6">
                <h3 className="font-display text-lg font-semibold uppercase">{o.name}</h3>
                {o.address && <p className="mt-2 text-black/70">{o.address}</p>}
                {o.phone && <p className="mt-1 font-mono text-sm">{o.phone}</p>}
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      <ClientLogosStrip />
      <CtaBlock label="Work with us" title="Tell us about your load" body="Share your requirement and our team will get back to you." variant="black" />
    </>
  )
}
