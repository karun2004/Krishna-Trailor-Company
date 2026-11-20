import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

export const PUBLIC_PATHS = ['/', '/about', '/krishna-trailor', '/heavy-haulage', '/radhe-travels', '/fleet', '/projects', '/contact']

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return PUBLIC_PATHS.map((p) => ({ url: p === '/' ? base : `${base}${p}` }))
}
