import type { Metadata } from 'next'
import { getSeo } from '@/lib/queries'

/** Metadata from published seo_metadata, falling back to a plain title. */
export async function pageMetadata(pageKey: string, fallbackTitle: string): Promise<Metadata> {
  const seo = await getSeo(pageKey).catch(() => null)
  const title = seo?.title || fallbackTitle
  const description = seo?.meta_description || undefined
  return {
    title,
    description,
    alternates: seo?.canonical_url ? { canonical: seo.canonical_url } : undefined,
    openGraph: { title, description, images: seo?.og_media?.url ? [{ url: seo.og_media.url }] : undefined },
  }
}
