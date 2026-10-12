-- Additive recruitment migration. Safe to rerun; existing registrations are preserved.
-- Run with the Supabase SQL Editor. The app uses its server-only service-role key.

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  role text not null check (role in ('reader', 'facilitator', 'cohost', 'outreach', 'venue')),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  email_normalized text generated always as (lower(btrim(email))) stored,
  phone text not null default '' check (char_length(phone) <= 40),
  meeting_language text not null check (meeting_language in ('it', 'en', 'either')),
  availability text not null default '' check (char_length(availability) <= 300),
  book_title text not null default '' check (char_length(book_title) <= 200),
  book_author text not null default '' check (char_length(book_author) <= 160),
  motivation text not null default '' check (char_length(motivation) <= 1500),
  locale text not null check (locale in ('it', 'en')),
  status text not null default 'new' check (status in ('new', 'contacted', 'active', 'withdrawn')),
  privacy_notice_version text not null check (char_length(privacy_notice_version) between 1 and 40)
);
create unique index if not exists registrations_email_role_unique on public.registrations (email_normalized, role);
create index if not exists registrations_created_at_idx on public.registrations (created_at desc);

alter table public.registrations enable row level security;
revoke all on table public.registrations from public, anon, authenticated;
grant select, insert, update, delete on table public.registrations to service_role;
-- No anon/authenticated policies: public callers cannot read or write contact data.

create table if not exists public.registration_rate_limits (
  key text primary key check (key ~ '^(email|ip):[a-f0-9]{64}$'),
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0)
);
create index if not exists registration_rate_limits_window_idx on public.registration_rate_limits (window_start);
alter table public.registration_rate_limits enable row level security;
revoke all on table public.registration_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.registration_rate_limits to service_role;

-- Each row is HMAC keyed; raw IP addresses/emails are never stored here.
-- The atomic upsert works across multiple Vercel instances and concurrent requests.
create or replace function public.consume_registration_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_attempts integer;
begin
  if p_key !~ '^(email|ip):[a-f0-9]{64}$' or p_limit not between 1 and 1000 or p_window_seconds not between 60 and 3600 then
    raise exception 'INVALID_RATE_LIMIT_ARGUMENT';
  end if;
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  delete from public.registration_rate_limits where window_start < now() - interval '24 hours';
  insert into public.registration_rate_limits as limits (key, window_start, attempts)
    values (p_key, v_window, 1)
    on conflict (key) do update
      set window_start = excluded.window_start,
          attempts = case when limits.window_start = excluded.window_start
            then least(limits.attempts + 1, p_limit + 1) else 1 end
    returning attempts into v_attempts;
  return v_attempts <= p_limit;
end;
$$;
revoke all on function public.consume_registration_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_registration_rate_limit(text, integer, integer) to service_role;

-- A read-only diagnostic; unlike the rate limiter, this never changes a row.
create or replace function public.registration_storage_health()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select to_regclass('public.registrations') is not null
    and to_regclass('public.registrations_email_role_unique') is not null
    and to_regclass('public.registration_rate_limits') is not null
    and to_regprocedure('public.consume_registration_rate_limit(text,integer,integer)') is not null
    and exists (select 1 from pg_catalog.pg_class where oid = to_regclass('public.registrations') and relrowsecurity)
    and exists (select 1 from pg_catalog.pg_class where oid = to_regclass('public.registration_rate_limits') and relrowsecurity);
$$;
revoke all on function public.registration_storage_health() from public, anon, authenticated;
grant execute on function public.registration_storage_health() to service_role;
