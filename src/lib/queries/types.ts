import type { SupabaseClient } from '@supabase/supabase-js'

/** Any Supabase client. Public reads must pass an anon/SSR client so RLS applies. */
export type Db = SupabaseClient

export type QueryOpts = {
  /** Override the client (tests, or callers that already hold one). Defaults to the SSR server client. */
  client?: Db
}

export type MediaRef = {
  url: string
  alt: string | null
  width: number | null
  height: number | null
}

export type WithMedia<T> = T & { media: MediaRef | null }

/** Public rows never carry verification_note: anon has no column grant for it. */
type Base = { id: string; sort_order: number }

export type Division = Base & {
  slug: string
  name: string
  tagline: string | null
  summary: string | null
  description: string | null
  cta_label: string | null
  cta_href: string | null
  hero_media_id: string | null
}
export type Service = Base & {
  slug: string
  name: string
  category: string | null
  summary: string | null
  description: string | null
  featured: boolean
  seo_title: string | null
  seo_description: string | null
  division_id: string | null
  main_media_id: string | null
}
export type FleetItem = Base & {
  slug: string
  name: string
  category: string
  description: string | null
  specifications: Record<string, unknown>
  capacity: string | null
  availability_status: string | null
  featured: boolean
  division_id: string | null
  main_media_id: string | null
}
export type ProjectImage = {
  id: string
  phase: 'before' | 'during' | 'after'
  caption: string | null
  sort_order: number
  media_id: string
}
export type Project = Base & {
  slug: string
  title: string
  location: string | null
  description: string | null
  service_category: string | null
  project_date: string | null
  featured: boolean
  division_id: string | null
  featured_media_id: string | null
}
export type ProjectWithImages = WithMedia<Project> & { images: WithMedia<ProjectImage>[] }
export type GalleryItem = { id: string; caption: string | null; sort_order: number; media_id: string }
export type GalleryAlbum = Base & {
  slug: string
  title: string
  description: string | null
  division_id: string | null
  cover_media_id: string | null
}
export type GalleryAlbumWithMedia = WithMedia<GalleryAlbum> & { items: WithMedia<GalleryItem>[] }
export type Milestone = Base & {
  year: string
  title: string
  description: string | null
  media_id: string | null
}
export type Testimonial = Base & {
  author_name: string
  author_role: string | null
  company: string | null
  quote: string
  division_id: string | null
}
export type Faq = Base & {
  question: string
  answer: string
  division_id: string | null
}
export type ClientLogo = Base & {
  name: string
  website_url: string | null
  media_id: string | null
}
export type Office = Base & {
  name: string
  address: string | null
  phone: string | null
  email: string | null
  is_head_office: boolean
  map_url: string | null
  division_id: string | null
}
export type PageBlock = { content: unknown; media: MediaRef | null }
export type Seo = {
  page_key: string
  slug: string | null
  title: string | null
  meta_description: string | null
  canonical_url: string | null
  og_media: MediaRef | null
}
