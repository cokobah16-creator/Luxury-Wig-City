-- =====================================================================
-- LUXURY WIG CITY — Initial Schema
-- Migration: 20260430_000001_initial_schema
-- =====================================================================
-- Covers all 14 entities from the master spec + auxiliary structures.
-- Idempotent where possible. Run via Supabase SQL editor or `supabase db push`.
-- =====================================================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- for fuzzy product search

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Auto-update timestamp trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Role helpers (used by RLS policies in migration 02)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_vendor_profile_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from public.vendor_profiles
  where user_id = auth.uid() and status = 'approved'
  limit 1;
$$;

-- =====================================================================
-- 1. PROFILES (extends auth.users)
-- =====================================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'customer'
              check (role in ('customer', 'vendor', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 2. VENDOR PROFILES
-- =====================================================================
create table public.vendor_profiles (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null unique references public.profiles(id) on delete cascade,
  store_name            text not null,
  store_tagline         text,
  store_category        text check (store_category in (
    'Bone Straight','Bouncy Hair','Pixie Curl','Closure Wigs','Frontal Wigs',
    'Braided Wigs','Colored Wigs','Short Wigs','Custom Wigs','Mixed'
  )),
  business_email        text,
  business_address      text,
  phone                 text,
  description           text,
  banner_image          text,
  profile_image         text,
  cac_certificate_url   text,
  government_id_url     text,
  instagram             text,
  other_socials         text,
  status                text not null default 'pending'
                        check (status in ('pending','approved','rejected','suspended')),
  rejection_reason      text,
  is_verified           boolean not null default false,
  rating                numeric(3,2) not null default 0,
  review_count          integer not null default 0,
  total_sales           integer not null default 0,
  total_revenue         numeric(12,2) not null default 0,
  plan                  text not null default 'free' check (plan in ('free','pro')),
  pro_started_date      timestamptz,
  pro_expires_date      timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index vendor_profiles_status_idx on public.vendor_profiles(status);
create index vendor_profiles_user_id_idx on public.vendor_profiles(user_id);
create index vendor_profiles_plan_idx on public.vendor_profiles(plan) where plan = 'pro';

create trigger vendor_profiles_updated_at
  before update on public.vendor_profiles
  for each row execute function public.handle_updated_at();

-- When a vendor is approved, auto-promote the user role
create or replace function public.handle_vendor_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and (old.status is null or old.status <> 'approved') then
    update public.profiles
    set role = 'vendor'
    where id = new.user_id and role = 'customer';
  end if;
  return new;
end;
$$;

create trigger vendor_profiles_role_sync
  after insert or update of status on public.vendor_profiles
  for each row execute function public.handle_vendor_approval();

-- =====================================================================
-- 3. PRODUCTS
-- =====================================================================
create table public.products (
  id                    uuid primary key default uuid_generate_v4(),
  vendor_id             uuid references public.vendor_profiles(id) on delete cascade,
  name                  text not null,
  description           text,
  price                 numeric(10,2) not null check (price >= 0),
  discount_price        numeric(10,2) check (discount_price is null or discount_price >= 0),
  category              text not null check (category in (
    'Bone Straight','Bouncy Hair','Pixie Curl','Closure Wigs','Frontal Wigs',
    'Braided Wigs','Colored Wigs','Short Wigs','Custom Wigs'
  )),
  lengths               text[] default '{}',
  cap_sizes             text[] default '{}',
  colors                text[] default '{}',
  images                text[] default '{}',
  video_url             text,
  stock                 integer not null default 0 check (stock >= 0),
  delivery_time         text,
  rating                numeric(3,2) not null default 0,
  review_count          integer not null default 0,
  search_count          integer not null default 0,
  status                text not null default 'active'
                        check (status in ('active','draft','suspended')),
  is_featured           boolean not null default false,
  is_platform_product   boolean not null default false,
  -- Denormalised for performant listings
  vendor_name           text,
  -- Full-text search column
  search_vector         tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(description,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(category,'')), 'C')
  ) stored,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index products_vendor_id_idx on public.products(vendor_id);
create index products_category_idx on public.products(category);
create index products_status_idx on public.products(status);
create index products_featured_idx on public.products(is_featured) where is_featured = true;
create index products_search_idx on public.products using gin(search_vector);
create index products_name_trgm_idx on public.products using gin(name gin_trgm_ops);
create index products_created_at_idx on public.products(created_at desc);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- Sync vendor_name on insert/update
create or replace function public.sync_product_vendor_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.vendor_id is not null then
    select store_name into new.vendor_name
    from public.vendor_profiles where id = new.vendor_id;
  end if;
  return new;
end;
$$;

create trigger products_sync_vendor_name
  before insert or update of vendor_id on public.products
  for each row execute function public.sync_product_vendor_name();

-- =====================================================================
-- 4. CART ITEMS
-- =====================================================================
create table public.cart_items (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid not null references public.profiles(id) on delete cascade,
  product_id      uuid not null references public.products(id) on delete cascade,
  quantity        integer not null default 1 check (quantity > 0),
  length          text,
  cap_size        text,
  color           text,
  -- Snapshot at time of add (price changes shouldn't break cart)
  price           numeric(10,2) not null,
  product_name    text,
  product_image   text,
  vendor_id       uuid references public.vendor_profiles(id) on delete set null,
  vendor_name     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(customer_id, product_id, length, cap_size, color)
);

create index cart_items_customer_id_idx on public.cart_items(customer_id);

create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();

-- =====================================================================
-- 5. WISHLIST ITEMS
-- =====================================================================
create table public.wishlist_items (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid not null references public.profiles(id) on delete cascade,
  product_id      uuid not null references public.products(id) on delete cascade,
  product_name    text,
  product_image   text,
  product_price   numeric(10,2),
  created_at      timestamptz not null default now(),
  unique(customer_id, product_id)
);

create index wishlist_items_customer_id_idx on public.wishlist_items(customer_id);

-- =====================================================================
-- 6. ORDERS
-- =====================================================================
create table public.orders (
  id                    uuid primary key default uuid_generate_v4(),
  -- Customer side
  customer_id           uuid not null references public.profiles(id) on delete restrict,
  customer_name         text,
  customer_email        text,
  -- Vendor side (one order per vendor — multi-vendor checkouts split into N orders)
  vendor_id             uuid references public.vendor_profiles(id) on delete set null,
  vendor_name           text,
  -- Line items as JSONB (product_id, product_name, price, quantity, length, cap_size, image_url)
  items                 jsonb not null default '[]'::jsonb,
  total_amount          numeric(10,2) not null check (total_amount >= 0),
  -- Shipping
  shipping_address      text,
  shipping_city         text,
  shipping_state        text,
  phone                 text,
  -- Status
  status                text not null default 'pending' check (status in (
    'pending','confirmed','admin_confirmed','packed',
    'dispatched','out_for_delivery','delivered','cancelled'
  )),
  payment_status        text not null default 'pending'
                        check (payment_status in ('pending','paid','failed','refunded')),
  payment_reference     text,
  flutterwave_tx_id     text,
  is_platform_order     boolean not null default false,
  tracking_updates      jsonb not null default '[]'::jsonb, -- [{status, timestamp, note}]
  delivery_confirmed    boolean not null default false,
  vendor_paid           boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders(customer_id);
create index orders_vendor_id_idx on public.orders(vendor_id);
create index orders_status_idx on public.orders(status);
create index orders_payment_status_idx on public.orders(payment_status);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_payment_reference_idx on public.orders(payment_reference) where payment_reference is not null;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- =====================================================================
-- 7. REVIEWS
-- =====================================================================
create table public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references public.products(id) on delete cascade,
  vendor_id       uuid references public.vendor_profiles(id) on delete cascade,
  customer_id     uuid not null references public.profiles(id) on delete cascade,
  customer_name   text,
  rating          integer not null check (rating between 1 and 5),
  comment         text,
  images          text[] default '{}',
  created_at      timestamptz not null default now(),
  unique(product_id, customer_id)
);

create index reviews_product_id_idx on public.reviews(product_id);
create index reviews_vendor_id_idx on public.reviews(vendor_id);

-- Recompute product + vendor ratings on review change
create or replace function public.recompute_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
  vid uuid;
  avg_rating numeric;
  count_reviews integer;
begin
  pid := coalesce(new.product_id, old.product_id);
  vid := coalesce(new.vendor_id, old.vendor_id);

  -- Product rating
  select avg(rating)::numeric(3,2), count(*)
    into avg_rating, count_reviews
    from public.reviews where product_id = pid;
  update public.products
    set rating = coalesce(avg_rating, 0), review_count = coalesce(count_reviews, 0)
    where id = pid;

  -- Vendor rating
  if vid is not null then
    select avg(rating)::numeric(3,2), count(*)
      into avg_rating, count_reviews
      from public.reviews where vendor_id = vid;
    update public.vendor_profiles
      set rating = coalesce(avg_rating, 0), review_count = coalesce(count_reviews, 0)
      where id = vid;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger reviews_recompute_ratings
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_product_rating();

-- =====================================================================
-- 8. MESSAGES
-- =====================================================================
create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  receiver_id     uuid not null references public.profiles(id) on delete cascade,
  conversation_id text not null, -- canonical: least(sender,receiver) || '_' || greatest(sender,receiver)
  sender_name     text,
  content         text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages(conversation_id, created_at desc);
create index messages_receiver_unread_idx on public.messages(receiver_id) where is_read = false;

-- =====================================================================
-- 9. NOTIFICATIONS
-- =====================================================================
create table public.notifications (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  user_email      text,
  title           text not null,
  message         text not null,
  type            text,        -- order_placed, vendor_approved, payment_confirmed, etc.
  link            text,
  role_target     text check (role_target in ('customer','vendor','admin')),
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications(user_id, created_at desc);
create index notifications_unread_idx on public.notifications(user_id) where is_read = false;

-- =====================================================================
-- 10. ANNOUNCEMENTS
-- =====================================================================
create table public.announcements (
  id              uuid primary key default uuid_generate_v4(),
  text            text not null,
  link_text       text,
  link_url        text,
  is_active       boolean not null default true,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

create index announcements_active_idx on public.announcements(is_active, display_order);

-- =====================================================================
-- 11. FLASH SALES
-- =====================================================================
create table public.flash_sales (
  id                uuid primary key default uuid_generate_v4(),
  product_id        uuid not null references public.products(id) on delete cascade,
  product_name      text,
  original_price    numeric(10,2),
  sale_price        numeric(10,2) not null check (sale_price >= 0),
  discount_percent  numeric(5,2),
  end_time          timestamptz not null,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create index flash_sales_active_idx on public.flash_sales(is_active, end_time);

-- =====================================================================
-- 12. IP VIOLATIONS
-- =====================================================================
create table public.ip_violations (
  id                uuid primary key default uuid_generate_v4(),
  reporter_email    text not null,
  reporter_name     text,
  ip_owner          text,
  violation_type    text,
  infringing_url    text,
  description       text not null,
  status            text not null default 'pending'
                    check (status in ('pending','under_review','escalated','resolved','dismissed')),
  admin_notes       text,
  admin_response    text,
  escalation_notes  text,
  resolved_by       uuid references public.profiles(id) on delete set null,
  resolved_at       timestamptz,
  created_at        timestamptz not null default now()
);

create index ip_violations_status_idx on public.ip_violations(status);

-- =====================================================================
-- 13. CUSTOM WIG REQUESTS
-- =====================================================================
create table public.custom_wig_requests (
  id                    uuid primary key default uuid_generate_v4(),
  customer_id           uuid not null references public.profiles(id) on delete cascade,
  customer_name         text,
  occasion              text,
  texture               text,
  length                text,
  color                 text,
  budget                text,
  wig_type              text,
  recommended_vendors   jsonb default '[]'::jsonb,
  ai_summary            text,
  created_at            timestamptz not null default now()
);

create index custom_wig_requests_customer_id_idx on public.custom_wig_requests(customer_id);

-- =====================================================================
-- 14. USER WIGS (wardrobe tracker)
-- =====================================================================
create table public.user_wigs (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  wig_id                   uuid references public.products(id) on delete set null,
  wig_name                 text,
  wig_type                 text,
  wig_image                text,
  purchase_date            date,
  wear_frequency           text not null default 'weekly'
                           check (wear_frequency in ('daily','few_times_week','weekly','occasionally')),
  last_washed              timestamptz,
  last_conditioned         timestamptz,
  last_installed           timestamptz,
  condition_status         text not null default 'good'
                           check (condition_status in ('good','needs_attention','time_to_replace')),
  condition_score          integer check (condition_score between 0 and 10),
  last_condition_check     timestamptz,
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index user_wigs_user_id_idx on public.user_wigs(user_id);

create trigger user_wigs_updated_at
  before update on public.user_wigs
  for each row execute function public.handle_updated_at();

-- =====================================================================
-- 15. COMMUNITY POSTS
-- =====================================================================
create table public.community_posts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  user_name       text,
  photo_url       text not null,
  caption         text,
  wig_id          uuid references public.products(id) on delete set null,
  wig_name        text,
  vendor_id       uuid references public.vendor_profiles(id) on delete set null,
  wig_category    text,
  likes_count     integer not null default 0,
  comments_count  integer not null default 0,
  created_at      timestamptz not null default now()
);

create index community_posts_user_id_idx on public.community_posts(user_id);
create index community_posts_likes_idx on public.community_posts(likes_count desc);
create index community_posts_recent_idx on public.community_posts(created_at desc);

-- Like join (so users can't double-like)
create table public.community_post_likes (
  post_id     uuid not null references public.community_posts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Sync likes_count on like/unlike
create or replace function public.sync_community_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
      set likes_count = likes_count + 1
      where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.community_posts
      set likes_count = greatest(0, likes_count - 1)
      where id = old.post_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger community_post_likes_sync
  after insert or delete on public.community_post_likes
  for each row execute function public.sync_community_likes_count();
