-- =====================================================================
-- LUXURY WIG CITY — AI Try-On Results
-- Migration: 20260504_000002_try_on_results
-- =====================================================================
-- Stores generated try-on previews with consent tracking, auto-expiry,
-- and a hard link to the source product so the customer can add to cart
-- directly from the result. RLS: users see only their own rows; admins
-- can read all (for moderation / debugging).
-- =====================================================================

do $$ begin
  create type public.try_on_status as enum ('pending', 'complete', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.try_on_results (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  product_id        uuid references public.products(id) on delete set null,
  product_name      text,
  source_url        text not null,                       -- uploaded selfie
  generated_url     text,                                -- AI output, null until ready
  status            public.try_on_status not null default 'pending',
  prompt            text,
  error_message     text,
  consent_given_at  timestamptz not null default now(),
  expires_at        timestamptz not null default (now() + interval '30 days'),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists try_on_results_user_id_idx
  on public.try_on_results (user_id, created_at desc);

create index if not exists try_on_results_expires_at_idx
  on public.try_on_results (expires_at)
  where status = 'complete';

create trigger try_on_results_updated_at
  before update on public.try_on_results
  for each row
  execute function public.handle_updated_at();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.try_on_results enable row level security;

-- Owner reads their own rows
drop policy if exists "try_on_select_self" on public.try_on_results;
create policy "try_on_select_self"
  on public.try_on_results for select
  to authenticated
  using (user_id = auth.uid());

-- Admins can read all (for support / moderation)
drop policy if exists "try_on_select_admin" on public.try_on_results;
create policy "try_on_select_admin"
  on public.try_on_results for select
  to authenticated
  using (public.is_admin());

-- Owner inserts their own rows. Service role (used by the edge function)
-- bypasses RLS, so the edge function can also write here on the user's behalf.
drop policy if exists "try_on_insert_self" on public.try_on_results;
create policy "try_on_insert_self"
  on public.try_on_results for insert
  to authenticated
  with check (user_id = auth.uid());

-- Owner updates their own rows (e.g., status -> 'complete' once the client
-- confirms it received the result; or for a future rerun).
drop policy if exists "try_on_update_self" on public.try_on_results;
create policy "try_on_update_self"
  on public.try_on_results for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Owner deletes their own rows (privacy: "delete this look")
drop policy if exists "try_on_delete_self" on public.try_on_results;
create policy "try_on_delete_self"
  on public.try_on_results for delete
  to authenticated
  using (user_id = auth.uid());
