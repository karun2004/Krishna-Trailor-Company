/** Safe readers for untyped page_content JSON. */
export function str(content: unknown, key: string): string | null {
  if (content && typeof content === 'object' && key in content) {
    const v = (content as Record<string, unknown>)[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return null
}

export function list(content: unknown, key: string): { title: string; body: string | null }[] {
  if (!content || typeof content !== 'object') return []
  const v = (content as Record<string, unknown>)[key]
  if (!Array.isArray(v)) return []
  return v.flatMap((i) => {
    if (typeof i === 'string' && i.trim()) return [{ title: i.trim(), body: null }]
    if (i && typeof i === 'object') {
      const t = str(i, 'title')
      return t ? [{ title: t, body: str(i, 'body') }] : []
    }
    return []
  })
}

const HREFS: Record<string, string> = {
  'krishna-trailor': '/krishna-trailor',
  'heavy-machinery': '/heavy-haulage',
  'heavy-haulage': '/heavy-haulage',
  'radhe-travels': '/radhe-travels',
}
export const divisionHref = (slug: string) => HREFS[slug] ?? '/contact'

const THEME: Record<string, 'krishna' | 'haulage' | 'radhe'> = {
  'krishna-trailor': 'krishna',
  'heavy-machinery': 'haulage',
  'heavy-haulage': 'haulage',
  'radhe-travels': 'radhe',
}
export const divisionTheme = (slug: string) => THEME[slug] ?? 'krishna'
