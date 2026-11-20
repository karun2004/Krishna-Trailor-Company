import { cn } from './cn'

export type GhostHeadlineProps = {
  children: React.ReactNode
  /** Background tone it sits on: outline is dark on light, light + faint fill on dark. */
  on?: 'light' | 'dark'
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
  className?: string
}

export function GhostHeadline({ children, on = 'light', as: Tag = 'h2', className }: GhostHeadlineProps) {
  return (
    <Tag
      className={cn(
        'font-display font-extrabold uppercase leading-[0.9] tracking-tighter text-[clamp(3rem,13vw,11rem)] [-webkit-text-stroke-width:1.5px] select-none',
        on === 'dark'
          ? 'text-white/[0.07] [-webkit-text-stroke-color:rgba(255,255,255,0.85)]'
          : 'text-transparent [-webkit-text-stroke-color:#101010]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
