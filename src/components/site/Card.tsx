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
  return <Tag className={cn('overflow-hidden rounded-2xl transition duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-lg focus-within:shadow-lg', V[variant], padded && 'p-6 md:p-8', className)}>{children}</Tag>
}
