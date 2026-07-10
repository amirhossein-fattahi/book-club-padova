-- Circolo del Libro — database schema
-- Paste this into the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run).

-- Readers who joined a reading circle.
create table if not exists public.group_signups (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  group_id    text not null,
  group_title text not null,
  name        text not null,
  email       text not null,
  phone       text not null,
  locale      text not null default 'en'
);

-- People applying to lead a new circle.
create table if not exists public.facilitator_applications (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null,
  email          text not null,
  book_title     text not null,
  book_author    text not null,
  motivation     text not null,
  preferred_day  text not null,
  preferred_time text,
  locale         text not null default 'en'
);

-- Enable Row Level Security. The app writes with the service-role key (which
-- bypasses RLS), so no public policies are needed — this keeps the tables
-- private and readable only from your Supabase dashboard.
alter table public.group_signups            enable row level security;
alter table public.facilitator_applications enable row level security;
