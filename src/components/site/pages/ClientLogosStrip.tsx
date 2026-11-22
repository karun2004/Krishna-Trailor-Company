import Image from 'next/image'
import { MediaImage, MonoLabel, SectionShell } from '@/components/site'
import { getClientLogos } from '@/lib/queries'

/** Renders nothing unless at least one published logo with media exists. */
export async function ClientLogosStrip() {
  const logos = (await getClientLogos()).filter((l) => l.media)
  // Admin-managed logos win; otherwise the supplied client logos in /public/logos.
  const files = [[1, 1000, 824], [2, 1556, 520], [3, 900, 900], [4, 1024, 720], [5, 2624, 680], [6, 900, 900], [7, 944, 856], [9, 1676, 480]] as const
  if (logos.length === 0) {
    return (
      <SectionShell variant="white" labelledBy="clients-h" className="!py-10 md:!py-14">
        <MonoLabel>Trusted by</MonoLabel>
        <h2 id="clients-h" className="mt-3 font-display text-3xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">Our clients</h2>
        <ul className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-4">
          {files.map(([n, w, h]) => (
            <li key={n} className="flex h-20 items-center justify-center">
              <Image src={`/logos/client-${n}.jpeg`} alt={`Client logo ${n}`} width={w} height={h} sizes="200px" className="max-h-20 w-auto object-contain mix-blend-multiply" />
            </li>
          ))}
        </ul>
      </SectionShell>
    )
  }
  return (
    <SectionShell variant="white" labelledBy="clients-h">
      <MonoLabel>Clients</MonoLabel>
      <h2 id="clients-h" className="sr-only">Our clients</h2>
      <ul className="mt-6 grid grid-cols-2 items-center gap-8 md:grid-cols-4 lg:grid-cols-6">
        {logos.map((l) => (
          <li key={l.id} className="flex justify-center">
            <MediaImage media={l.media} alt={l.name} sizes="160px" className="max-h-16 w-auto object-contain" />
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
