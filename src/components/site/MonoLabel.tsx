import { cn } from './cn'

export type MonoLabelProps = {
  /** Index, e.g. 1 or "01". Numbers are zero-padded. Omit for a label with no index. */
  index?: number | string
  children: React.ReactNode
  className?: string
}

export function MonoLabel({ index, children, className }: MonoLabelProps) {
  const idx = typeof index === 'number' ? String(index).padStart(2, '0') : index
  return (
    <p className={cn('font-mono text-xs uppercase tracking-[0.18em] text-current/70', className)}>
      {idx ? <span>{idx} — </span> : null}
      {children}
    </p>
  )
}
