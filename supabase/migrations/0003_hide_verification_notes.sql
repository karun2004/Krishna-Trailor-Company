-- 0003: verification_note is internal editorial metadata. Anon must not read it,
-- even on published rows. Replace table-level SELECT with column-level SELECT that
-- omits verification_note. authenticated keeps its full table-level grants (admin UI).
-- NOTE: columns added to these tables later must be added to the anon grant too.

revoke select on public.business_divisions from anon;
grant select (id, slug, name, tagline, summary, description, hero_media_id, cta_label, cta_href, published, sort_order, created_at, updated_at) on public.business_divisions to anon;

revoke select on public.client_logos from anon;
grant select (id, name, media_id, website_url, published, sort_order, created_at, updated_at) on public.client_logos to anon;

revoke select on public.faqs from anon;
grant select (id, question, answer, division_id, published, sort_order, created_at, updated_at) on public.faqs to anon;

revoke select on public.fleet_items from anon;
grant select (id, name, slug, category, description, specifications, capacity, availability_status, main_media_id, featured, division_id, published, sort_order, created_at, updated_at) on public.fleet_items to anon;

revoke select on public.gallery_albums from anon;
grant select (id, title, slug, description, cover_media_id, division_id, published, sort_order, created_at, updated_at) on public.gallery_albums to anon;

revoke select on public.office_locations from anon;
grant select (id, name, address, phone, email, is_head_office, map_url, division_id, published, sort_order, created_at, updated_at) on public.office_locations to anon;

revoke select on public.page_content from anon;
grant select (id, page_key, block_key, content, media_id, published, sort_order, created_at, updated_at) on public.page_content to anon;

revoke select on public.projects from anon;
grant select (id, title, slug, location, description, service_category, project_date, featured_media_id, featured, division_id, published, sort_order, created_at, updated_at) on public.projects to anon;

revoke select on public.seo_metadata from anon;
grant select (id, page_key, slug, title, meta_description, og_media_id, canonical_url, published, sort_order, created_at, updated_at) on public.seo_metadata to anon;

revoke select on public.services from anon;
grant select (id, name, slug, category, summary, description, main_media_id, featured, seo_title, seo_description, division_id, published, sort_order, created_at, updated_at) on public.services to anon;

revoke select on public.testimonials from anon;
grant select (id, author_name, author_role, company, quote, approved, division_id, published, sort_order, created_at, updated_at) on public.testimonials to anon;

revoke select on public.timeline_milestones from anon;
grant select (id, year, title, description, media_id, published, sort_order, created_at, updated_at) on public.timeline_milestones to anon;
