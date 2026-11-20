export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/krishna-trailor', label: 'Krishna Trailor' },
  { href: '/heavy-haulage', label: 'Heavy Haulage' },
  { href: '/radhe-travels', label: 'Radhe Travels' },
  { href: '/fleet', label: 'Fleet' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
] as const

export function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
