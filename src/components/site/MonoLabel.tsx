import { cn } from './cn'

export type MonoLabelProps = {
  /** Index kept for API compat but no longer rendered. */
  index?: number | string
  children: React.ReactNode
  className?: string
}

export function MonoLabel({ children, className }: MonoLabelProps) {
  return (
    <p className={cn('font-mono text-xs uppercase tracking-[0.18em] text-current/70', className)}>
      {children}
    </p>
  )
}
