-- 0011_rate_limits: DB-backed sliding-window rate limiting for the public enquiry API.
-- An in-memory limiter does not work on serverless, so hits live in Postgres.
-- Only keyed-hash IPs are stored, never raw addresses. The table is unreachable
-- through the API (RLS on, no policy, no grants); the single entry point is
-- enquiry_rate_limit_hit(), executable only by service_role.

create table public.enquiry_rate_events (
  id bigint generated always as identity primary key,
  ip_hash text not null check (char_length(ip_hash) between 1 and 128),
  created_at timestamptz not null default now()
);

create index enquiry_rate_events_ip_created_idx on public.enquiry_rate_events (ip_hash, created_at);
create index enquiry_rate_events_created_idx on public.enquiry_rate_events (created_at);

alter table public.enquiry_rate_events enable row level security;
revoke all on public.enquiry_rate_events from public, anon, authenticated;

-- Atomic check-and-increment. The per-hash advisory lock serialises concurrent
-- callers for one IP, so N parallel requests can never slip past the limit.
-- Rejected attempts are not recorded. Old rows (older than max(window, 1h)) are
-- purged opportunistically on every call.
create function public.enquiry_rate_limit_hit(
  p_ip_hash text,
  p_limit int default 5,
  p_window_seconds int default 600
)
returns table (allowed boolean, retry_after_seconds int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
  v_oldest timestamptz;
begin
  if p_ip_hash is null or p_ip_hash = '' or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));

  delete from public.enquiry_rate_events
  where created_at < now() - make_interval(secs => greatest(p_window_seconds, 3600));

  select count(*), min(created_at)
    into v_count, v_oldest
  from public.enquiry_rate_events
  where ip_hash = p_ip_hash
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_limit then
    return query select false,
      greatest(1, ceil(extract(epoch from (v_oldest + make_interval(secs => p_window_seconds) - now())))::int);
    return;
  end if;

  insert into public.enquiry_rate_events (ip_hash) values (p_ip_hash);
  return query select true, 0;
end;
$$;

revoke all on function public.enquiry_rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.enquiry_rate_limit_hit(text, int, int) to service_role;
