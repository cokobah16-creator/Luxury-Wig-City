-- =====================================================================
-- LUXURY WIG CITY — Security Patches
-- Migration: 20260430_000004_security_patches
-- =====================================================================
-- Run after migration 03.
-- Fixes: role self-escalation, vendor self-approval, customer self-payment,
--        missing vendor role revocation, and notification delivery.
-- =====================================================================

-- =====================================================================
-- PATCH 1: Block profile role self-escalation
-- Without this, any user can run: UPDATE profiles SET role = 'admin'
-- The RLS policy only checks id = auth.uid(), not which fields change.
-- =====================================================================
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Role changes require admin privileges';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role_change
  before update on public.profiles
  for each row execute function public.guard_profile_role_change();

-- =====================================================================
-- PATCH 2: Block vendor self-approval
-- Without this, a pending vendor can flip status = 'approved' on their
-- own row, which also fires the role-promotion trigger.
-- =====================================================================
create or replace function public.guard_vendor_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status and not public.is_admin() then
    raise exception 'Vendor status changes require admin approval';
  end if;
  return new;
end;
$$;

create trigger vendor_profiles_guard_status_change
  before update on public.vendor_profiles
  for each row execute function public.guard_vendor_status_change();

-- =====================================================================
-- PATCH 3: Block customer self-payment
-- Without this, a customer can set payment_status = 'paid' on their
-- own order, bypassing Flutterwave entirely.
-- Customers may only flip delivery_confirmed.
-- Vendors may manage status / tracking_updates but not payment fields.
-- Admins are unrestricted.
-- =====================================================================
create or replace function public.guard_order_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then return new; end if;

  -- Vendor for this specific order: allow status/tracking changes, block payment
  if new.vendor_id = public.current_vendor_profile_id() then
    if new.payment_status is distinct from old.payment_status
      or new.vendor_paid is distinct from old.vendor_paid
    then
      raise exception 'Payment fields can only be updated by admin';
    end if;
    return new;
  end if;

  -- Customer: only delivery_confirmed is writable
  if new.payment_status   is distinct from old.payment_status
    or new.status          is distinct from old.status
    or new.vendor_paid     is distinct from old.vendor_paid
    or new.total_amount    is distinct from old.total_amount
  then
    raise exception 'Customers can only confirm delivery on their orders';
  end if;

  return new;
end;
$$;

create trigger orders_guard_update
  before update on public.orders
  for each row execute function public.guard_order_update();

-- =====================================================================
-- PATCH 4: Revoke vendor role on suspension / rejection
-- handle_vendor_approval (migration 01) promotes on approval but never
-- demotes. A suspended vendor retains vendor dashboard access forever.
-- =====================================================================
create or replace function public.handle_vendor_status_revoke()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('rejected', 'suspended')
    and old.status not in ('rejected', 'suspended')
  then
    update public.profiles
      set role = 'customer'
      where id = new.user_id and role = 'vendor';
  end if;
  return new;
end;
$$;

create trigger vendor_profiles_role_revoke
  after update of status on public.vendor_profiles
  for each row execute function public.handle_vendor_status_revoke();

-- =====================================================================
-- PATCH 5: Notifications — replace admin-only insert with:
--   (a) users can insert for themselves (order confirmation UX)
--   (b) server-side trigger creates the vendor "new order" notification
--       (cross-user, so must bypass RLS via security definer)
-- =====================================================================

-- Drop the admin-only insert policy so we can replace it
drop policy if exists "notifications_insert_admin" on public.notifications;

-- Users can create notifications for themselves (client-side order confirm)
create policy "notifications_insert_self"
  on public.notifications for insert
  to authenticated
  with check (user_id = auth.uid());

-- Admins can insert for anyone (broadcast announcements etc.)
create policy "notifications_insert_admin"
  on public.notifications for insert
  to authenticated
  with check (public.is_admin());

-- Server-side trigger: when an order is created, notify customer + vendor.
-- Runs as security definer so it bypasses RLS for the cross-user vendor notification.
create or replace function public.notify_on_order_placed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vendor_user_id uuid;
begin
  -- Notify the customer
  insert into public.notifications (user_id, title, message, type, link)
  values (
    new.customer_id,
    'Order Placed',
    'Your order #' || left(new.id::text, 8) || ' has been placed. We''ll update you when it''s confirmed.',
    'order_placed',
    '/orders/' || new.id
  );

  -- Notify the vendor (if this is a vendor order, not a platform order)
  if new.vendor_id is not null then
    select user_id into v_vendor_user_id
      from public.vendor_profiles where id = new.vendor_id;
    if v_vendor_user_id is not null then
      insert into public.notifications (user_id, title, message, type, link)
      values (
        v_vendor_user_id,
        'New Order',
        'You have a new order from ' || coalesce(new.customer_name, 'a customer') || ' — ₦' || new.total_amount::text,
        'new_order',
        '/admin/orders/' || new.id
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger orders_notify_on_placed
  after insert on public.orders
  for each row execute function public.notify_on_order_placed();
