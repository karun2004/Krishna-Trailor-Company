import { cn } from './cn'

export type SectionVariant = 'white' | 'black' | 'soft' | 'blue' | 'navy'

const VARIANTS: Record<SectionVariant, string> = {
  white: 'bg-white text-black',
  black: 'bg-black text-white',
  soft: 'bg-soft text-black',
  blue: 'bg-blue text-navy',
  navy: 'bg-navy text-white',
}

export type SectionShellProps = {
  variant?: SectionVariant
  as?: 'section' | 'div' | 'footer'
  id?: string
  /** id of the heading naming this section (landmark label). */
  labelledBy?: string
  /** Vertical padding; default true. */
  padded?: boolean
  /** Constrain content to the max-width container; default true. */
  contained?: boolean
  className?: string
  children: React.ReactNode
}

/** Full-bleed band with hard cuts between variants (no gradients/rounding). */
export function SectionShell({
  variant = 'white', as: Tag = 'section', id, labelledBy, padded = true, contained = true, className, children,
}: SectionShellProps) {
  return (
    <Tag id={id} aria-labelledby={labelledBy} data-variant={variant} className={cn('w-full overflow-x-clip', VARIANTS[variant], padded && 'py-20 md:py-28', className)}>
      {contained ? <div className="mx-auto w-full max-w-7xl px-5 md:px-8">{children}</div> : children}
    </Tag>
  )
}
