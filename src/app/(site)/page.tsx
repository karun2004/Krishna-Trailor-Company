import { Button, Card, GhostHeadline, MediaImage, MonoLabel, Reveal, SectionShell } from '@/components/site'

// Placeholder: the real, CMS-driven homepage is milestone M7.
export default function Home() {
  return (
    <>
      <SectionShell variant="black">
        <MonoLabel index={1}>Krishna Trailor Company</MonoLabel>
        <GhostHeadline as="h1" on="dark" className="mt-6">Krishna Trailor</GhostHeadline>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/contact">Get a Quote</Button>
          <Button href="/fleet" variant="outline">Our Fleet</Button>
        </div>
      </SectionShell>
      <SectionShell variant="white">
        <Reveal>
          <MonoLabel index={2}>Sections</MonoLabel>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card variant="soft"><MediaImage media={null} aspect="16/9" /></Card>
            <Card variant="dark"><p className="font-display text-xl uppercase">Placeholder</p></Card>
          </div>
        </Reveal>
      </SectionShell>
    </>
  )
}
