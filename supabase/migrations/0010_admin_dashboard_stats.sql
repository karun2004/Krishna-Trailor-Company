-- 0010_admin_dashboard_stats: one-round-trip aggregate for the admin dashboard.
-- SECURITY INVOKER (default): counts and lists are filtered by the caller's RLS,
-- so a non-admin only ever sees what they could already read. Not granted to anon.
create function public.admin_dashboard_stats()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'counts', jsonb_build_object(
      'images',    (select count(*) from public.media_assets),
      'projects',  (select count(*) from public.projects),
      'equipment', (select count(*) from public.fleet_items),
      'services',  (select count(*) from public.services),
      'enquiries', (select count(*) from public.enquiries)
    ),
    'recent_uploads', coalesce((
      select jsonb_agg(to_jsonb(u)) from (
        select id, storage_path, alt, category, created_at
        from public.media_assets order by created_at desc limit 5
      ) u), '[]'::jsonb),
    'recent_enquiries', coalesce((
      select jsonb_agg(to_jsonb(e)) from (
        select id, name, division, status, created_at
        from public.enquiries order by created_at desc limit 5
      ) e), '[]'::jsonb)
  );
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
