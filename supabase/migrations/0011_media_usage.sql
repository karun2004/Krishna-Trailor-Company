-- 0011_media_usage: one query listing every place a media asset is referenced.
-- Every table holding a media_assets FK is covered; add a branch here when a new media FK is added.
-- SECURITY INVOKER + service_role only: called by the admin API after requireAdminApi().
create or replace function public.media_usage(p_media_id uuid)
returns table (entity text, entity_id uuid, label text, field text)
language sql
stable
security invoker
set search_path = public
as $$
  select 'Division', id, name, 'Hero image' from business_divisions where hero_media_id = p_media_id
  union all select 'Service', id, name, 'Main image' from services where main_media_id = p_media_id
  union all select 'Fleet item', id, name, 'Main image' from fleet_items where main_media_id = p_media_id
  union all select 'Project', id, title, 'Featured image' from projects where featured_media_id = p_media_id
  union all select 'Project', pi.project_id, p.title, 'Project image (' || pi.phase || ')'
    from project_images pi join projects p on p.id = pi.project_id where pi.media_id = p_media_id
  union all select 'Gallery album', id, title, 'Cover image' from gallery_albums where cover_media_id = p_media_id
  union all select 'Gallery album', gm.album_id, a.title, 'Album image'
    from gallery_album_media gm join gallery_albums a on a.id = gm.album_id where gm.media_id = p_media_id
  union all select 'Timeline', id, year || ' ' || title, 'Milestone image' from timeline_milestones where media_id = p_media_id
  union all select 'Client logo', id, name, 'Logo' from client_logos where media_id = p_media_id
  union all select 'Page content', id, page_key || ' / ' || block_key, 'Block image' from page_content where media_id = p_media_id
  union all select 'SEO', id, page_key, 'Social share image' from seo_metadata where og_media_id = p_media_id
$$;

revoke all on function public.media_usage(uuid) from public, anon, authenticated;
grant execute on function public.media_usage(uuid) to service_role;
