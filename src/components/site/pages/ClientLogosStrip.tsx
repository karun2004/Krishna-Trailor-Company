import { MediaImage, MonoLabel, SectionShell } from '@/components/site'
import { getClientLogos } from '@/lib/queries'

/** Renders nothing unless at least one published logo with media exists. */
export async function ClientLogosStrip() {
  const logos = (await getClientLogos()).filter((l) => l.media)
  if (logos.length === 0) return null
  return (
    <SectionShell variant="white" labelledBy="clients-h">
      <MonoLabel>Clients</MonoLabel>
      <h2 id="clients-h" className="sr-only">Our clients</h2>
      <ul className="mt-6 grid grid-cols-2 items-center gap-8 md:grid-cols-4 lg:grid-cols-6">
        {logos.map((l) => (
          <li key={l.id} className="flex justify-center">
            <MediaImage media={l.media} alt={l.name} sizes="160px" className="max-h-16 w-auto object-contain grayscale" />
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
