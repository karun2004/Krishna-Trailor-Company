import { Button, MonoLabel, Reveal } from '@/components/site'

export function DivisionCta({ type, label, phones, heading = 'Talk to us' }: { type: 'industrial' | 'travel'; label?: string | null; phones?: { name?: string; number: string }[]; heading?: string }) {
  return (
    <Reveal>
      <MonoLabel>Get in touch</MonoLabel>
      <h2 className="mt-4 font-display text-3xl font-extrabold uppercase md:text-5xl">{heading}</h2>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button href={`/contact?type=${type}`}>{label || 'Get a Quote'}</Button>
        {phones?.map((p) => (
          <Button key={p.number} href={`tel:${p.number.replace(/[^\d+]/g, '')}`} variant="outline">{p.name ? `${p.name} ` : ''}{p.number}</Button>
        ))}
      </div>
    </Reveal>
  )
}
