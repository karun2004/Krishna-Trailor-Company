import type { Metadata } from 'next'
import { env } from '@/lib/env'
import { getSeo } from '@/lib/queries'
import type { Seo } from '@/lib/queries'

export const SITE_NAME = 'Krishna Trailor Company'

export type SeoFallback = { title: string; description: string; path: string }

export const siteUrl = (): string => env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')

/** Pure: merges a (possibly missing) seo row over the fallback. Titles already naming the company skip the root template. */
export function composeMetadata(seo: Seo | null, fallback: SeoFallback, base: string = siteUrl()): Metadata {
  const title = seo?.title?.trim() || fallback.title
  const description = seo?.meta_description?.trim() || fallback.description
  const path = seo?.slug?.trim() || fallback.path
  const canonical = seo?.canonical_url?.trim() || new URL(path, `${base}/`).toString()
  const ogImage = seo?.og_media?.url
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  return {
    title: title.includes(SITE_NAME) ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: canonical,
      ...(ogImage ? { images: [{ url: ogImage, ...(seo?.og_media?.alt ? { alt: seo.og_media.alt } : {}) }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export async function buildMetadata(pageKey: string, fallback: SeoFallback): Promise<Metadata> {
  const seo = await getSeo(pageKey).catch(() => null)
  return composeMetadata(seo, fallback)
}
