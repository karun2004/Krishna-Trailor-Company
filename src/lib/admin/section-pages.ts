/** Pages that accept free-form sections (client- and server-safe; kept out of the 'use server' file). */
export const SECTION_PAGES = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'about', label: 'About', path: '/about' },
  { key: 'krishna-trailor', label: 'Krishna Trailor', path: '/krishna-trailor' },
  { key: 'heavy-haulage', label: 'Heavy Haulage', path: '/heavy-haulage' },
  { key: 'radhe-travels', label: 'Radhe Travels', path: '/radhe-travels' },
  { key: 'fleet', label: 'Fleet', path: '/fleet' },
  { key: 'projects', label: 'Projects', path: '/projects' },
  { key: 'contact', label: 'Contact', path: '/contact' },
] as const
