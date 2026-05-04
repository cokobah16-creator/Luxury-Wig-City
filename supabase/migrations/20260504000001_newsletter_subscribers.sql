-- =====================================================================
-- LUXURY WIG CITY — Newsletter Subscribers
-- Migration: 20260504_000001_newsletter_subscribers
-- =====================================================================
-- Captures footer email signups. Anyone (including anon) can insert,
-- only admins can read or delete. Email is unique to dedupe re-submits
-- gracefully via on-conflict-do-nothing in the client.
-- =====================================================================

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  source       text default 'footer',
  is_active    boolean not null default true,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- Anyone (anon + authenticated) can subscribe
drop policy if exists "newsletter_insert_public" on public.newsletter_subscribers;
create policy "newsletter_insert_public"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

-- Only admins can read the list
drop policy if exists "newsletter_select_admin" on public.newsletter_subscribers;
create policy "newsletter_select_admin"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

-- Only admins can update or delete (e.g., unsubscribe)
drop policy if exists "newsletter_update_admin" on public.newsletter_subscribers;
create policy "newsletter_update_admin"
  on public.newsletter_subscribers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "newsletter_delete_admin" on public.newsletter_subscribers;
create policy "newsletter_delete_admin"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.is_admin());
