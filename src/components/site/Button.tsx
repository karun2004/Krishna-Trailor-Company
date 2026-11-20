import Link from 'next/link'
import { cn } from './cn'

export type ButtonVariant = 'primary-orange' | 'dark' | 'light' | 'outline'

const VARIANTS: Record<ButtonVariant, string> = {
  // Uses the division accent var: orange by default, navy under data-division="radhe".
  'primary-orange': 'bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110',
  dark: 'bg-black text-white hover:bg-neutral-800',
  light: 'bg-white text-black hover:bg-neutral-200',
  outline: 'border border-current bg-transparent hover:bg-current/10',
}

type Common = { variant?: ButtonVariant; className?: string; children: React.ReactNode }
export type ButtonLinkProps = Common & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>
export type ButtonButtonProps = Common & { href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>
export type ButtonProps = ButtonLinkProps | ButtonButtonProps

export const buttonClass = (variant: ButtonVariant = 'primary-orange', className?: string) =>
  cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50',
    VARIANTS[variant],
    className,
  )

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { href, variant, className, children, external, ...rest } = props as ButtonLinkProps
    const cls = buttonClass(variant, className)
    if (external || /^(https?:|mailto:|tel:)/.test(href)) {
      return <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>{children}</a>
    }
    return <Link href={href} className={cls} {...rest}>{children}</Link>
  }
  const { variant, className, children, type = 'button', ...rest } = props as ButtonButtonProps
  return <button type={type} className={buttonClass(variant, className)} {...rest}>{children}</button>
}
