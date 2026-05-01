-- 0005 — filterable scalar attributes for products
--
-- The storefront filter sidebar (Shop page) selects on single-valued
-- attributes: texture, length, lace type, primary colour, hair type, badge.
-- Those are kept separate from the existing variant arrays
-- (lengths / cap_sizes / colors) which feed the variant pickers on the
-- product detail page.
--
-- All columns are nullable so existing rows survive without a backfill.
-- Apply this after 0004_security_patches.sql.

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
create index if not exists products_badge_idx         on public.products(badge) where badge is not null;
