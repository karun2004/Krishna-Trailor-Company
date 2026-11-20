import { cn } from './cn'

export type CardProps = {
  variant?: 'light' | 'soft' | 'dark' | 'blue'
  as?: 'div' | 'article' | 'li'
  padded?: boolean
  className?: string
  children: React.ReactNode
}

const V = {
  light: 'bg-white text-black border border-black/10',
  soft: 'bg-soft text-black',
  dark: 'bg-black text-white border border-white/10',
  blue: 'bg-blue text-navy',
}

export function Card({ variant = 'light', as: Tag = 'div', padded = true, className, children }: CardProps) {
  return <Tag className={cn('overflow-hidden rounded-2xl', V[variant], padded && 'p-6 md:p-8', className)}>{children}</Tag>
}
