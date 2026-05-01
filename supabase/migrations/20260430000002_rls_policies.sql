-- =====================================================================
-- LUXURY WIG CITY — Row Level Security Policies
-- Migration: 20260430_000002_rls_policies
-- =====================================================================
-- Run after the schema migration.
-- Pattern: enable RLS on every table, then per-action policies.
-- Uses helper functions public.is_admin() and public.current_vendor_profile_id().
-- =====================================================================

-- =====================================================================
-- PROFILES
-- =====================================================================
alter table public.profiles enable row level security;

-- Anyone authenticated can view minimal profile info (full_name, avatar) for
-- review attribution, vendor names, community posts, etc.
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Anon can also read profiles (so anonymous shoppers see vendor names on cards)
create policy "profiles_select_anon"
  on public.profiles for select
  to anon
  using (true);

-- Users update their own profile only
create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can update any profile (e.g., promote to admin)
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Inserts are handled by the auth trigger, but allow admin manual insert
create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

-- =====================================================================
-- VENDOR PROFILES
-- =====================================================================
alter table public.vendor_profiles enable row level security;

-- Public read of approved vendors only
create policy "vendor_profiles_select_approved"
  on public.vendor_profiles for select
  to anon, authenticated
  using (status = 'approved');

-- Owner can read own profile regardless of status (so they see "pending" / "rejected" screens)
create policy "vendor_profiles_select_own"
  on public.vendor_profiles for select
  to authenticated
  using (user_id = auth.uid());

-- Admin can read all
create policy "vendor_profiles_select_admin"
  on public.vendor_profiles for select
  to authenticated
  using (public.is_admin());

-- Authenticated users can apply (insert their own profile)
create policy "vendor_profiles_insert_self"
  on public.vendor_profiles for insert
  to authenticated
  with check (user_id = auth.uid());

-- Owner updates own (limited fields enforced at app level — RLS allows full update on own row)
create policy "vendor_profiles_update_own"
  on public.vendor_profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admin updates any (approve/reject/grant pro/suspend)
create policy "vendor_profiles_update_admin"
  on public.vendor_profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "vendor_profiles_delete_admin"
  on public.vendor_profiles for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- PRODUCTS
-- =====================================================================
alter table public.products enable row level security;

-- Public read of active products only (drafts + suspended hidden)
create policy "products_select_active"
  on public.products for select
  to anon, authenticated
  using (status = 'active');

-- Vendor reads own products regardless of status
create policy "products_select_own_vendor"
  on public.products for select
  to authenticated
  using (vendor_id = public.current_vendor_profile_id());

-- Admin reads all
create policy "products_select_admin"
  on public.products for select
  to authenticated
  using (public.is_admin());

-- Vendor creates products under their vendor_id only
create policy "products_insert_vendor"
  on public.products for insert
  to authenticated
  with check (vendor_id = public.current_vendor_profile_id());

create policy "products_insert_admin"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "products_update_own_vendor"
  on public.products for update
  to authenticated
  using (vendor_id = public.current_vendor_profile_id())
  with check (vendor_id = public.current_vendor_profile_id());

create policy "products_update_admin"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_delete_own_vendor"
  on public.products for delete
  to authenticated
  using (vendor_id = public.current_vendor_profile_id());

create policy "products_delete_admin"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- CART ITEMS
-- =====================================================================
alter table public.cart_items enable row level security;

create policy "cart_items_owner_all"
  on public.cart_items for all
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- =====================================================================
-- WISHLIST ITEMS
-- =====================================================================
alter table public.wishlist_items enable row level security;

create policy "wishlist_items_owner_all"
  on public.wishlist_items for all
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- =====================================================================
-- ORDERS
-- =====================================================================
alter table public.orders enable row level security;

-- Customers see their own orders
create policy "orders_select_customer"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid());

-- Vendors see orders for their store
create policy "orders_select_vendor"
  on public.orders for select
  to authenticated
  using (vendor_id = public.current_vendor_profile_id());

-- Admin sees all
create policy "orders_select_admin"
  on public.orders for select
  to authenticated
  using (public.is_admin());

-- Customers create orders for themselves
create policy "orders_insert_customer"
  on public.orders for insert
  to authenticated
  with check (customer_id = auth.uid());

-- Customers update their own orders only for delivery confirmation
-- (limited fields enforced at app level — RLS just gates ownership)
create policy "orders_update_customer"
  on public.orders for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- Vendors update orders for their store (status, tracking)
create policy "orders_update_vendor"
  on public.orders for update
  to authenticated
  using (vendor_id = public.current_vendor_profile_id())
  with check (vendor_id = public.current_vendor_profile_id());

-- Admin updates any
create policy "orders_update_admin"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- REVIEWS
-- =====================================================================
alter table public.reviews enable row level security;

-- Anyone reads reviews (so product/vendor pages show them)
create policy "reviews_select_all"
  on public.reviews for select
  to anon, authenticated
  using (true);

-- Customer creates a review only for products they purchased
create policy "reviews_insert_purchaser"
  on public.reviews for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.customer_id = auth.uid()
        and o.payment_status = 'paid'
        and o.items @> jsonb_build_array(jsonb_build_object('product_id', reviews.product_id))
    )
  );

-- Customer updates / deletes own review
create policy "reviews_update_own"
  on public.reviews for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "reviews_delete_own"
  on public.reviews for delete
  to authenticated
  using (customer_id = auth.uid());

create policy "reviews_delete_admin"
  on public.reviews for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- MESSAGES
-- =====================================================================
alter table public.messages enable row level security;

create policy "messages_select_participants"
  on public.messages for select
  to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "messages_insert_sender"
  on public.messages for insert
  to authenticated
  with check (sender_id = auth.uid());

-- Receiver can mark as read
create policy "messages_update_receiver"
  on public.messages for update
  to authenticated
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

create policy "messages_select_admin"
  on public.messages for select
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- NOTIFICATIONS
-- =====================================================================
alter table public.notifications enable row level security;

create policy "notifications_select_owner"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_owner"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Inserts come from server-side functions (use service role) or admin
create policy "notifications_insert_admin"
  on public.notifications for insert
  to authenticated
  with check (public.is_admin());

-- =====================================================================
-- ANNOUNCEMENTS
-- =====================================================================
alter table public.announcements enable row level security;

-- Anyone reads active announcements (the marquee at the top of the site)
create policy "announcements_select_active"
  on public.announcements for select
  to anon, authenticated
  using (is_active = true);

create policy "announcements_select_admin"
  on public.announcements for select
  to authenticated
  using (public.is_admin());

create policy "announcements_admin_write"
  on public.announcements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- FLASH SALES
-- =====================================================================
alter table public.flash_sales enable row level security;

create policy "flash_sales_select_active"
  on public.flash_sales for select
  to anon, authenticated
  using (is_active = true and end_time > now());

create policy "flash_sales_select_admin"
  on public.flash_sales for select
  to authenticated
  using (public.is_admin());

create policy "flash_sales_admin_write"
  on public.flash_sales for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- IP VIOLATIONS
-- =====================================================================
alter table public.ip_violations enable row level security;

-- Anyone (including anon) can submit a report
create policy "ip_violations_insert_public"
  on public.ip_violations for insert
  to anon, authenticated
  with check (true);

-- Only admin reads / updates
create policy "ip_violations_admin_read"
  on public.ip_violations for select
  to authenticated
  using (public.is_admin());

create policy "ip_violations_admin_update"
  on public.ip_violations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- CUSTOM WIG REQUESTS
-- =====================================================================
alter table public.custom_wig_requests enable row level security;

create policy "custom_wig_requests_select_owner"
  on public.custom_wig_requests for select
  to authenticated
  using (customer_id = auth.uid());

create policy "custom_wig_requests_insert_owner"
  on public.custom_wig_requests for insert
  to authenticated
  with check (customer_id = auth.uid());

create policy "custom_wig_requests_admin_read"
  on public.custom_wig_requests for select
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- USER WIGS
-- =====================================================================
alter table public.user_wigs enable row level security;

create policy "user_wigs_owner_all"
  on public.user_wigs for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =====================================================================
-- COMMUNITY POSTS
-- =====================================================================
alter table public.community_posts enable row level security;

-- Public feed
create policy "community_posts_select_all"
  on public.community_posts for select
  to anon, authenticated
  using (true);

create policy "community_posts_insert_owner"
  on public.community_posts for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "community_posts_update_owner"
  on public.community_posts for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "community_posts_delete_owner"
  on public.community_posts for delete
  to authenticated
  using (user_id = auth.uid());

create policy "community_posts_delete_admin"
  on public.community_posts for delete
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- COMMUNITY POST LIKES
-- =====================================================================
alter table public.community_post_likes enable row level security;

create policy "community_post_likes_select_all"
  on public.community_post_likes for select
  to anon, authenticated
  using (true);

create policy "community_post_likes_insert_self"
  on public.community_post_likes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "community_post_likes_delete_self"
  on public.community_post_likes for delete
  to authenticated
  using (user_id = auth.uid());
