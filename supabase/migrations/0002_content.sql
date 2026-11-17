-- 0002_content: public-site content tables, enquiries, and the private
-- `enquiry-attachments` bucket, with RLS.
--
-- Security model (same as 0001; second line of defence behind server-side requireAdmin()):
--   * RLS is enabled on every table created here.
--   * Default API privileges are revoked and re-granted minimally, so every denied
--     write surfaces as an explicit 42501 rather than a silent zero-row result.
--   * anon: SELECT only, and only rows with published = true. Child tables with no
--     `published` flag of their own (project_images, gallery_album_media) are gated
--     through their published parent. testimonials additionally require
--     approved = true. No anon write, ever.
--   * authenticated: gets table privileges, but every write and every read of an
--     unpublished row requires public.is_admin(). A signed-in NON-admin sees exactly
--     what anon sees and can write nothing.
--   * page_content and seo_metadata also carry `published` (default false) and anon
--     reads are gated on it like every other content table.
--   * enquiries: NO anon grant and NO anon policy. The public site submits enquiries
--     through /api/enquiry (validation + rate limiting), which inserts with the
--     service role. Only admins may read / update / delete them.
--   * Every image reference is ON DELETE SET NULL: deleting a media asset degrades
--     the content row, it never destroys it. (Only project_images and
--     gallery_album_media cascade, and only from their own PARENT project / album.)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.enquiry_status as enum (
  'new',
  'contacted',
  'in_progress',
  'completed',
  'archived'
);

create type public.enquiry_division as enum (
  'krishna_trailor',
  'heavy_haulage',
  'radhe_travels'
);

create type public.project_phase as enum (
  'before',
  'during',
  'after'
);

create type public.fleet_category as enum (
  'tractor_pullers',
  'low_bed_trailers',
  'semi_bed_trailers',
  'hydraulic_axle_systems',
  'cranes',
  'forklifts',
  'excavators',
  'other',
  'sleeper_buses',
  'seater_buses'
);

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text,
  summary text,
  description text,
  main_media_id uuid null references public.media_assets (id) on delete set null,
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  division_id uuid null references public.business_divisions (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- fleet_items
-- ---------------------------------------------------------------------------
create table public.fleet_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category public.fleet_category not null,
  description text,
  specifications jsonb not null default '{}'::jsonb,
  capacity text,
  availability_status text,
  main_media_id uuid null references public.media_assets (id) on delete set null,
  featured boolean not null default false,
  division_id uuid null references public.business_divisions (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- projects (+ project_images: children, cascade from the parent project only)
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  location text,
  description text,
  service_category text,
  project_date date,
  featured_media_id uuid null references public.media_assets (id) on delete set null,
  featured boolean not null default false,
  division_id uuid null references public.business_divisions (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  media_id uuid null references public.media_assets (id) on delete set null,
  phase public.project_phase not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- gallery_albums (+ gallery_album_media: ordered join, cascade from the album only)
-- ---------------------------------------------------------------------------
create table public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_media_id uuid null references public.media_assets (id) on delete set null,
  division_id uuid null references public.business_divisions (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_album_media (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums (id) on delete cascade,
  media_id uuid null references public.media_assets (id) on delete set null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (album_id, media_id)
);

-- ---------------------------------------------------------------------------
-- timeline_milestones
-- ---------------------------------------------------------------------------
create table public.timeline_milestones (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  description text,
  media_id uuid null references public.media_assets (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- testimonials (public only when published AND approved)
-- ---------------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  company text,
  quote text not null,
  approved boolean not null default false,
  division_id uuid null references public.business_divisions (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  division_id uuid null references public.business_divisions (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- client_logos
-- ---------------------------------------------------------------------------
create table public.client_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  media_id uuid null references public.media_assets (id) on delete set null,
  website_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- office_locations
-- ---------------------------------------------------------------------------
create table public.office_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  email text,
  is_head_office boolean not null default false,
  map_url text,
  division_id uuid null references public.business_divisions (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- page_content: editable copy blocks (e.g. the homepage editor)
-- ---------------------------------------------------------------------------
create table public.page_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  block_key text not null,
  content jsonb not null default '{}'::jsonb,
  media_id uuid null references public.media_assets (id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_key, block_key)
);

-- ---------------------------------------------------------------------------
-- seo_metadata: per-page SEO overrides
-- ---------------------------------------------------------------------------
create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  slug text,
  title text,
  meta_description text,
  og_media_id uuid null references public.media_assets (id) on delete set null,
  canonical_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- enquiries (admin-only; written by the service role from /api/enquiry)
-- The length CHECKs are an abuse guard: they hold even for the service role.
-- ---------------------------------------------------------------------------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  division public.enquiry_division not null,
  enquiry_type text,
  status public.enquiry_status not null default 'new',
  name text not null,
  phone text,
  email text,
  company text,
  details jsonb not null default '{}'::jsonb,
  message text,
  attachment_path text null,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enquiries_name_len check (char_length(name) <= 200),
  constraint enquiries_phone_len check (char_length(phone) <= 50),
  constraint enquiries_email_len check (char_length(email) <= 320),
  constraint enquiries_company_len check (char_length(company) <= 200),
  constraint enquiries_enquiry_type_len check (char_length(enquiry_type) <= 100),
  constraint enquiries_message_len check (char_length(message) <= 5000),
  constraint enquiries_attachment_path_len check (char_length(attachment_path) <= 500),
  constraint enquiries_internal_notes_len check (char_length(internal_notes) <= 5000),
  constraint enquiries_details_size check (octet_length(details::text) <= 20000)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- (UNIQUE slug / page_key constraints already provide their own indexes.)
-- Listing order for anon queries: (published, sort_order), as in 0001.
-- ---------------------------------------------------------------------------
create index services_published_sort_idx on public.services (published, sort_order);
create index services_division_published_idx on public.services (division_id, published);
create index services_main_media_id_idx on public.services (main_media_id);

create index fleet_items_published_sort_idx on public.fleet_items (published, sort_order);
create index fleet_items_division_published_idx on public.fleet_items (division_id, published);
create index fleet_items_category_idx on public.fleet_items (category);
create index fleet_items_main_media_id_idx on public.fleet_items (main_media_id);

create index projects_published_sort_idx on public.projects (published, sort_order);
create index projects_division_published_idx on public.projects (division_id, published);
create index projects_featured_media_id_idx on public.projects (featured_media_id);

create index project_images_project_sort_idx on public.project_images (project_id, sort_order);
create index project_images_media_id_idx on public.project_images (media_id);

create index gallery_albums_published_sort_idx on public.gallery_albums (published, sort_order);
create index gallery_albums_division_published_idx on public.gallery_albums (division_id, published);
create index gallery_albums_cover_media_id_idx on public.gallery_albums (cover_media_id);

create index gallery_album_media_album_sort_idx on public.gallery_album_media (album_id, sort_order);
create index gallery_album_media_media_id_idx on public.gallery_album_media (media_id);

create index timeline_milestones_published_sort_idx on public.timeline_milestones (published, sort_order);
create index timeline_milestones_media_id_idx on public.timeline_milestones (media_id);

create index testimonials_published_sort_idx on public.testimonials (published, sort_order);
create index testimonials_division_published_idx on public.testimonials (division_id, published);

create index faqs_published_sort_idx on public.faqs (published, sort_order);
create index faqs_division_published_idx on public.faqs (division_id, published);

create index client_logos_published_sort_idx on public.client_logos (published, sort_order);
create index client_logos_media_id_idx on public.client_logos (media_id);

create index office_locations_published_sort_idx on public.office_locations (published, sort_order);
create index office_locations_division_published_idx on public.office_locations (division_id, published);

create index page_content_published_sort_idx on public.page_content (published, sort_order);
create index page_content_media_id_idx on public.page_content (media_id);

create index seo_metadata_slug_idx on public.seo_metadata (slug);
create index seo_metadata_published_sort_idx on public.seo_metadata (published, sort_order);
create index seo_metadata_og_media_id_idx on public.seo_metadata (og_media_id);

create index enquiries_status_created_idx on public.enquiries (status, created_at desc);
create index enquiries_division_idx on public.enquiries (division);

-- ---------------------------------------------------------------------------
-- updated_at triggers (every table that has updated_at)
-- ---------------------------------------------------------------------------
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();
create trigger fleet_items_set_updated_at
  before update on public.fleet_items
  for each row execute function public.set_updated_at();
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
create trigger project_images_set_updated_at
  before update on public.project_images
  for each row execute function public.set_updated_at();
create trigger gallery_albums_set_updated_at
  before update on public.gallery_albums
  for each row execute function public.set_updated_at();
create trigger gallery_album_media_set_updated_at
  before update on public.gallery_album_media
  for each row execute function public.set_updated_at();
create trigger timeline_milestones_set_updated_at
  before update on public.timeline_milestones
  for each row execute function public.set_updated_at();
create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();
create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();
create trigger client_logos_set_updated_at
  before update on public.client_logos
  for each row execute function public.set_updated_at();
create trigger office_locations_set_updated_at
  before update on public.office_locations
  for each row execute function public.set_updated_at();
create trigger page_content_set_updated_at
  before update on public.page_content
  for each row execute function public.set_updated_at();
create trigger seo_metadata_set_updated_at
  before update on public.seo_metadata
  for each row execute function public.set_updated_at();
create trigger enquiries_set_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table privileges (defence in depth beneath RLS): strip Supabase's default
-- ALL grants, then grant back exactly what each role needs.
-- ---------------------------------------------------------------------------
revoke all on
  public.services, public.fleet_items, public.projects, public.project_images,
  public.gallery_albums, public.gallery_album_media, public.timeline_milestones,
  public.testimonials, public.faqs, public.client_logos, public.office_locations,
  public.page_content, public.seo_metadata, public.enquiries
  from anon, authenticated;

-- anon: SELECT on public content only. NOTHING on enquiries.
grant select on
  public.services, public.fleet_items, public.projects, public.project_images,
  public.gallery_albums, public.gallery_album_media, public.timeline_milestones,
  public.testimonials, public.faqs, public.client_logos, public.office_locations,
  public.page_content, public.seo_metadata
  to anon;

-- authenticated: full DML, always narrowed by the admin policies below.
grant select, insert, update, delete on
  public.services, public.fleet_items, public.projects, public.project_images,
  public.gallery_albums, public.gallery_album_media, public.timeline_milestones,
  public.testimonials, public.faqs, public.client_logos, public.office_locations,
  public.page_content, public.seo_metadata, public.enquiries
  to authenticated;

-- ---------------------------------------------------------------------------
-- RLS enabled on every table
-- ---------------------------------------------------------------------------
alter table public.services enable row level security;
alter table public.fleet_items enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_album_media enable row level security;
alter table public.timeline_milestones enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.client_logos enable row level security;
alter table public.office_locations enable row level security;
alter table public.page_content enable row level security;
alter table public.seo_metadata enable row level security;
alter table public.enquiries enable row level security;

-- ---------------------------------------------------------------------------
-- Policies: published-gated content tables
-- (public read of published rows for anon + signed-in users; admin does all)
-- ---------------------------------------------------------------------------
create policy "services: public read published"
  on public.services for select to anon, authenticated
  using (published = true);
create policy "services: admin all"
  on public.services for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "fleet_items: public read published"
  on public.fleet_items for select to anon, authenticated
  using (published = true);
create policy "fleet_items: admin all"
  on public.fleet_items for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "projects: public read published"
  on public.projects for select to anon, authenticated
  using (published = true);
create policy "projects: admin all"
  on public.projects for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "gallery_albums: public read published"
  on public.gallery_albums for select to anon, authenticated
  using (published = true);
create policy "gallery_albums: admin all"
  on public.gallery_albums for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "timeline_milestones: public read published"
  on public.timeline_milestones for select to anon, authenticated
  using (published = true);
create policy "timeline_milestones: admin all"
  on public.timeline_milestones for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "testimonials: public read published and approved"
  on public.testimonials for select to anon, authenticated
  using (published = true and approved = true);
create policy "testimonials: admin all"
  on public.testimonials for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "faqs: public read published"
  on public.faqs for select to anon, authenticated
  using (published = true);
create policy "faqs: admin all"
  on public.faqs for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "client_logos: public read published"
  on public.client_logos for select to anon, authenticated
  using (published = true);
create policy "client_logos: admin all"
  on public.client_logos for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "office_locations: public read published"
  on public.office_locations for select to anon, authenticated
  using (published = true);
create policy "office_locations: admin all"
  on public.office_locations for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "page_content: public read published"
  on public.page_content for select to anon, authenticated
  using (published = true);
create policy "page_content: admin all"
  on public.page_content for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "seo_metadata: public read published"
  on public.seo_metadata for select to anon, authenticated
  using (published = true);
create policy "seo_metadata: admin all"
  on public.seo_metadata for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Policies: child tables, gated through the published parent.
-- (The subquery runs under the caller's own RLS on the parent, which already
--  hides unpublished parents; the explicit published = true keeps the intent
--  readable and holds even if the parent policy is ever loosened.)
-- ---------------------------------------------------------------------------
create policy "project_images: public read via published project"
  on public.project_images for select to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id and p.published = true
    )
  );
create policy "project_images: admin all"
  on public.project_images for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "gallery_album_media: public read via published album"
  on public.gallery_album_media for select to anon, authenticated
  using (
    exists (
      select 1 from public.gallery_albums a
      where a.id = gallery_album_media.album_id and a.published = true
    )
  );
create policy "gallery_album_media: admin all"
  on public.gallery_album_media for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Policies: enquiries -- admin only. Deliberately NO anon policy (and no anon
-- grant above): the public site writes via the service role in /api/enquiry.
-- ---------------------------------------------------------------------------
create policy "enquiries: admin all"
  on public.enquiries for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Storage: PRIVATE bucket `enquiry-attachments`.
-- Objects are uploaded by the service role (/api/enquiry); only admins may read or
-- delete them. No policy at all for anon / non-admin, and no INSERT or UPDATE
-- policy for anyone. Policies are scoped by bucket_id so the `media` bucket's
-- policies (0001) are neither widened nor changed.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'enquiry-attachments',
  'enquiry-attachments',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do nothing;

create policy "enquiry-attachments bucket: admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'enquiry-attachments' and (select public.is_admin()));

create policy "enquiry-attachments bucket: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'enquiry-attachments' and (select public.is_admin()));
