import { Button, MonoLabel, SectionShell } from '@/components/site'

export function CtaBlock({ label, title, body, variant = 'soft' }: { label: string; title: string; body: string; variant?: 'soft' | 'black' }) {
  const dark = variant === 'black'
  return (
    <SectionShell variant={variant}>
      <MonoLabel>{label}</MonoLabel>
      <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold uppercase tracking-tight md:text-5xl">{title}</h2>
      <p className={`mt-4 max-w-2xl ${dark ? 'text-white/70' : 'text-black/70'}`}>{body}</p>
      <div className="mt-8"><Button href="/contact">Contact us</Button></div>
    </SectionShell>
  )
}
