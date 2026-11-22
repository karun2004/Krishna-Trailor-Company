import { MediaImage, MonoLabel, PageHero, Reveal, SectionShell } from '@/components/site'
import { ClientLogosStrip } from '@/components/site/pages/ClientLogosStrip'
import { CtaBlock } from '@/components/site/pages/CtaBlock'
import { getOffices, getTestimonials, getTimeline } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { CustomSections } from '@/components/site/CustomSections'
import { getSlots } from '@/lib/queries/slots'
import { TestimonialsSection } from '@/components/site/home/Sections'

export const dynamic = 'force-dynamic'
export const generateMetadata = () => buildMetadata('about', { title: 'About', description: 'About Krishna Trailor Company, a trailer transport business in Manimajra, Chandigarh, founded in 1987.', path: '/about' })

export default async function AboutPage() {
  const slot = await getSlots('about')
  const [timeline, offices, testimonials] = await Promise.all([getTimeline(), getOffices(), getTestimonials()])
  const story = [1, 2, 3, 4].map((n) => slot(`media_story_${n}`)).filter((m) => m !== null)
  const head = offices.find((o) => o.is_head_office)
  const others = offices.filter((o) => !o.is_head_office)
  return (
    <>
      <PageHero
        label="About"
        title="About KTC"
        media={slot('hero')}
        lead={`Krishna Trailor Company was founded in 1987 under Mr. Kuldeep Singh, with its head office in Chandigarh${others.some((o) => /bhopal/i.test(o.name)) ? ' and a parallel office in Bhopal' : ''}.`}
      />

      <CustomSections page="about" placement="top" />
      {/* Media container for about section photos/videos */}
      <SectionShell variant="white" labelledBy="about-media-h">
        <MonoLabel>Krishna Trailor Company</MonoLabel>
        <h2 id="about-media-h" className="mt-4 font-display text-3xl font-semibold uppercase tracking-tight md:text-5xl">Our Story</h2>
        {story.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {story.map((m, i) => (
              <li key={i}><MediaImage media={m} aspect="4/3" sizes="(min-width:1024px) 25vw, (min-width:480px) 50vw, 100vw" className="rounded-xl" /></li>
            ))}
          </ul>
        ) : null}
      </SectionShell>

      {timeline.length > 0 && (
        <SectionShell variant="soft" labelledBy="timeline-h">
          <MonoLabel>Our journey</MonoLabel>
          <h2 id="timeline-h" className="mt-4 font-display text-3xl font-semibold uppercase tracking-tight md:text-5xl">Timeline</h2>
          <ol className="mt-8 border-l-2 border-orange/40">
            {timeline.map((m) => (
              <li key={m.id}>
                <Reveal as="div" className="relative pb-6 pl-8 last:pb-0">
                  <span aria-hidden="true" className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-orange ring-4 ring-soft" />
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-orange-text">{m.year}</p>
                  <h3 className="mt-0.5 font-display text-xl font-semibold uppercase">{m.title}</h3>
                  {m.description && <p className="mt-1 max-w-2xl text-sm text-black/70">{m.description}</p>}
                  {m.media && <MediaImage media={m.media} aspect="16/9" sizes="(min-width:768px) 600px, 100vw" className="mt-3 max-w-xl rounded-xl" />}
                </Reveal>
              </li>
            ))}
          </ol>
        </SectionShell>
      )}

      {(head || others.length > 0) && (
        <SectionShell variant="soft" labelledBy="offices-h">
          <MonoLabel>Offices</MonoLabel>
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

      <CustomSections page="about" placement="bottom" />
      {/* Testimonials & Client Logos */}
      {testimonials.length > 0 && <TestimonialsSection items={testimonials} />}

      <ClientLogosStrip />
      <CtaBlock label="Work with us" title="Tell us about your load" body="Share your requirement and our team will get back to you." variant="black" />
    </>
  )
}
