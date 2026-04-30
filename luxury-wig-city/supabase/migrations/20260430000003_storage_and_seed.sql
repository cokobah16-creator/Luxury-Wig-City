-- =====================================================================
-- LUXURY WIG CITY — Storage Buckets + Seed Data
-- Migration: 20260430_000003_storage_and_seed
-- =====================================================================

-- =====================================================================
-- STORAGE BUCKETS
-- =====================================================================
-- product-images:    vendor uploads (public read, owner write)
-- vendor-documents:  CAC certs, gov IDs (private — admin + owner only)
-- vendor-branding:   banner + profile images (public read, owner write)
-- user-uploads:      try-on photos, community posts, wig wardrobe (public read, owner write)
-- =====================================================================

insert into storage.buckets (id, name, public)
  values
    ('product-images',    'product-images',    true),
    ('vendor-documents',  'vendor-documents',  false),
    ('vendor-branding',   'vendor-branding',   true),
    ('user-uploads',      'user-uploads',      true)
  on conflict (id) do nothing;

-- =====================================================================
-- STORAGE POLICIES
-- =====================================================================

-- Product images: public read, vendor uploads to their own folder (vendor_id/...)
create policy "product_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product_images_vendor_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.current_vendor_profile_id()::text
  );

create policy "product_images_vendor_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.current_vendor_profile_id()::text
  );

create policy "product_images_vendor_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and ((storage.foldername(name))[1] = public.current_vendor_profile_id()::text or public.is_admin())
  );

-- Vendor documents: private — only owner + admin
create policy "vendor_docs_owner_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'vendor-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "vendor_docs_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vendor-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Vendor branding: public read, vendor writes to their own folder
create policy "vendor_branding_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'vendor-branding');

create policy "vendor_branding_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vendor-branding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "vendor_branding_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'vendor-branding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- User uploads: public read, user writes to their own folder
create policy "user_uploads_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'user-uploads');

create policy "user_uploads_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "user_uploads_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-uploads'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- =====================================================================
-- SEED DATA — launch announcements
-- =====================================================================

insert into public.announcements (text, link_text, link_url, is_active, display_order) values
  ('Free Abuja delivery on orders above ₦150,000', 'Shop now', '/Shop', true, 1),
  ('Become a Verified Vendor — reach thousands of buyers', 'Apply', '/VendorLanding', true, 2),
  ('AI Wig Match — find your perfect style in 60 seconds', 'Take quiz', '/WigMatch', true, 3)
on conflict do nothing;
