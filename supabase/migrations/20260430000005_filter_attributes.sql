-- =====================================================================
-- LUXURY WIG CITY — Filter Scalar Attributes
-- Migration: 20260430_000005_filter_attributes
-- =====================================================================
-- Adds filterable scalar columns to products so the Shop filter sidebar
-- can query by texture, length, density, lace type, colour, hair type,
-- and badge without scanning the lengths[]/colors[] variant arrays.
-- =====================================================================

alter table public.products
  add column if not exists texture       text,
  add column if not exists length_inches integer,
  add column if not exists density       integer,
  add column if not exists lace_type     text,
  add column if not exists primary_color text,
  add column if not exists hair_type     text,
  add column if not exists badge         text;

create index if not exists products_texture_idx       on public.products(texture);
create index if not exists products_length_inches_idx on public.products(length_inches);
create index if not exists products_primary_color_idx on public.products(primary_color);
create index if not exists products_hair_type_idx     on public.products(hair_type);
