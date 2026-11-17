-- 0001_core: media, divisions, settings, profiles + RLS + the `media` storage bucket.
--
-- Security model (second line of defence; the first is server-side requireAdmin()):
--   * RLS is enabled on every table created here.
--   * anon: SELECT only (rows with published = true where the table has that column;
--     media_assets and site_settings have no `published` column and hold only
--     public-site data, so they are readable). No anon writes, ever.
--   * authenticated: admin (public.is_admin()) may do everything on content tables.
--   * profiles is a privilege boundary: a user may read only their own row and NO
--     API role may write it. Admin roles are granted via the service role / a script.

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------
create type public.media_category as enum (
  'homepage',
  'krishna_trailor',
  'heavy_haulage',
  'radhe_travels',
  'fleet',
  'cranes',
  'excavators',
  'jcb',
  'industrial_jacks',
  'odc_cargo',
  'projects',
  'gallery',
  'team',
  'clients',
  'other'
);

-- ---------------------------------------------------------------------------
-- Shared trigger function: keep updated_at current.
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (privilege boundary)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- is_admin(): true iff the caller has a profiles row with role = 'admin'.
-- SECURITY DEFINER so it can read profiles regardless of the caller's RLS;
-- search_path is pinned empty and every name is schema-qualified.
-- ---------------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- business_divisions
-- (hero_media_id's FK is added after media_assets exists: the two tables
--  reference each other.)
-- ---------------------------------------------------------------------------
create table public.business_divisions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  summary text,
  description text,
  hero_media_id uuid null,
  cta_label text,
  cta_href text,
  published boolean not null default false,
  sort_order int not null default 0,
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media_assets
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  bucket text not null default 'media',
  alt text,
  caption text,
  description text,
  category public.media_category not null,
  division_id uuid null references public.business_divisions (id) on delete set null,
  mime_type text not null,
  width int,
  height int,
  size_bytes bigint,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_divisions
  add constraint business_divisions_hero_media_id_fkey
  foreign key (hero_media_id) references public.media_assets (id) on delete set null;

-- ---------------------------------------------------------------------------
-- site_settings (public contact info only; never store secrets here)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index media_assets_category_idx on public.media_assets (category);
create index media_assets_division_id_idx on public.media_assets (division_id);
create index business_divisions_published_sort_idx on public.business_divisions (published, sort_order);
-- Supports the ON DELETE SET NULL scan when a media asset is removed.
create index business_divisions_hero_media_id_idx on public.business_divisions (hero_media_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers (every table that has updated_at)
-- ---------------------------------------------------------------------------
create trigger business_divisions_set_updated_at
  before update on public.business_divisions
  for each row execute function public.set_updated_at();

create trigger media_assets_set_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table privileges (defence in depth beneath RLS).
-- Supabase grants ALL on new public tables to anon/authenticated by default;
-- strip that back to exactly what each role needs.
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.business_divisions, public.media_assets, public.site_settings
  from anon, authenticated;

grant select on public.business_divisions, public.media_assets, public.site_settings to anon;
grant select, insert, update, delete
  on public.business_divisions, public.media_assets, public.site_settings to authenticated;
-- profiles: read-only for signed-in users (own row, via RLS); nothing for anon.
grant select on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- RLS enabled on every table
-- ---------------------------------------------------------------------------
alter table public.business_divisions enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
-- (profiles enabled above)

-- ---------------------------------------------------------------------------
-- Policies: profiles — own row only, SELECT only. Deliberately NO insert /
-- update / delete policy for anon or authenticated.
-- ---------------------------------------------------------------------------
create policy "profiles: read own row"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Policies: business_divisions
-- ---------------------------------------------------------------------------
create policy "business_divisions: public read published"
  on public.business_divisions for select
  to anon, authenticated
  using (published = true);

create policy "business_divisions: admin all"
  on public.business_divisions for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Policies: media_assets (no `published` column; public site must resolve URLs)
-- ---------------------------------------------------------------------------
create policy "media_assets: public read"
  on public.media_assets for select
  to anon, authenticated
  using (true);

create policy "media_assets: admin all"
  on public.media_assets for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Policies: site_settings (no `published` column; public contact info only)
-- ---------------------------------------------------------------------------
create policy "site_settings: public read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings: admin all"
  on public.site_settings for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Storage: public bucket `media`; anyone may read, only admins may write.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media bucket: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media bucket: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "media bucket: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "media bucket: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
