-- =====================================================================
-- LUXURY WIG CITY — Real Catalog Replacement
-- Migration: 20260504_000004_real_catalog
-- =====================================================================
-- Replaces the 8 placeholder mock products from the previous seed
-- migration with 12 real products. Only platform-owned products are
-- removed — vendor-uploaded products are untouched.
--
-- IMPORTANT — before running this migration:
--   1. Save the 12 wig images to your computer (filenames listed below)
--   2. Upload them to Supabase Storage → product-images bucket →
--      create a 'platform' folder → drop all 12 images in there
--   3. Find/replace YOUR_PROJECT_REF in this file with your actual
--      Supabase project ref (the bit before .supabase.co in your
--      VITE_SUPABASE_URL — e.g. for https://abcdxyz.supabase.co the
--      ref is "abcdxyz")
--   4. supabase db push
--
-- Required filenames in product-images/platform/ :
--   lewa-body-wave-1.jpg
--   pixie-curl-bob-1.jpg
--   burgundy-pixie-curl-1.jpg
--   burmese-curl-1.jpg
--   layered-body-wave-1.jpg
--   ginger-wavy-1.jpg
--   kim-k-bob-1.jpg
--   burgundy-body-wave-1.jpg
--   copper-body-wave-1.jpg
--   platinum-blonde-wavy-1.jpg
--   mocha-latte-wavy-1.jpg
--   synthetic-bone-straight-1.jpg
-- =====================================================================

-- Wipe previous platform-owned seeds (vendor products keep their rows)
delete from public.products
  where is_platform_product = true and vendor_id is null;

insert into public.products (
  name, description, price, discount_price, category,
  lengths, cap_sizes, colors, images,
  stock, delivery_time, rating, review_count, status,
  is_featured, is_platform_product, vendor_name,
  texture, length_inches, density, lace_type, primary_color, hair_type, badge
) values

-- 1. Lewa Body Wave (32" black body wave, 13x6 HD lace)
(
  'Lewa Body Wave',
  'Statement-length body wave that falls below the waist. 13x6 HD lace front melts into any skin tone, hand-tied for a natural part. The red-carpet wig.',
  345000, null, 'Bouncy Hair',
  array['28"','30"','32"'], array['Small','Medium','Large'], array['Natural Black'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/lewa-body-wave-1.jpg'],
  6, '24-48 hours', 4.9, 0, 'active',
  true, true, 'Luxury Wig City',
  'Wavy', 32, 200, '13x6 HD Lace', 'Natural Black', 'Human Hair', 'Bestseller'
),

-- 2. Pixie Curl Bob (14" curly bob, 5x5 closure)
(
  'Pixie Curl Bob',
  'Bouncy shoulder-length pixie curls with all-day hold. Glueless 5x5 closure construction — secure in 30 seconds. Wear-and-go luxury.',
  175000, null, 'Pixie Curl',
  array['12"','14"','16"'], array['Small','Medium','Large'], array['Natural Black'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/pixie-curl-bob-1.jpg'],
  12, '24 hours', 4.8, 0, 'active',
  true, true, 'Luxury Wig City',
  'Curly', 14, 180, '5x5 Closure', 'Natural Black', 'Human Hair', 'New'
),

-- 3. Burgundy Pixie Curl (22" burgundy curls, 13x4 HD lace)
(
  'Burgundy Pixie Curl',
  'Hand-coloured burgundy curls with a deep wine sheen. 13x4 HD frontal, pre-plucked hairline. Custom-tinted for warm undertones.',
  255000, null, 'Pixie Curl',
  array['18"','20"','22"','24"'], array['Small','Medium','Large'], array['Burgundy'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/burgundy-pixie-curl-1.jpg'],
  5, '48-72 hours', 4.9, 0, 'active',
  true, true, 'Luxury Wig City',
  'Curly', 22, 200, '13x4 HD Lace', 'Burgundy', 'Human Hair', 'Editor''s Pick'
),

-- 4. Burmese Curl (26" black tight curls, 13x4 HD lace)
(
  'Burmese Curl',
  'Defined Burmese curl pattern with bounce that holds for weeks. Premium raw-hair sourced. Cuticles aligned for tangle-free wear.',
  285000, null, 'Frontal Wigs',
  array['22"','24"','26"','28"'], array['Small','Medium','Large'], array['Natural Black'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/burmese-curl-1.jpg'],
  7, '48-72 hours', 4.8, 0, 'active',
  true, true, 'Luxury Wig City',
  'Curly', 26, 200, '13x4 HD Lace', 'Natural Black', 'Human Hair', null
),

-- 5. Layered Body Wave (22" black layered waves, 13x6 HD lace)
(
  'Layered Body Wave',
  'Salon-cut layered body wave with face-framing pieces. 13x6 HD lace, side-part friendly. Made for the woman who wants effortless movement.',
  235000, null, 'Frontal Wigs',
  array['18"','20"','22"','24"'], array['Small','Medium','Large'], array['Natural Black'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/layered-body-wave-1.jpg'],
  9, '24-48 hours', 4.9, 0, 'active',
  true, true, 'Luxury Wig City',
  'Wavy', 22, 200, '13x6 HD Lace', 'Natural Black', 'Human Hair', 'Bestseller'
),

-- 6. Ginger Wavy (24" copper/ginger waves with bangs, 13x6 HD lace)
(
  'Ginger Wavy',
  'Hand-painted ginger waves with a soft fringe. The salon favourite for autumn drops. Custom colour, certified by our master colorist.',
  275000, null, 'Colored Wigs',
  array['22"','24"','26"'], array['Small','Medium','Large'], array['Honey Blonde'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/ginger-wavy-1.jpg'],
  4, '48-72 hours', 5.0, 0, 'active',
  true, true, 'Luxury Wig City',
  'Wavy', 24, 200, '13x6 HD Lace', 'Honey Blonde', 'Human Hair', 'Limited'
),

-- 7. Kim K Bob (12" honey blonde sleek bob)
(
  'Kim K Bob',
  'Razor-sharp sleek bob in honey blonde with darker roots. Iconic short cut, redone luxury. 13x4 lace front for a clean middle part.',
  165000, null, 'Short Wigs',
  array['10"','12"','14"'], array['Small','Medium','Large'], array['Honey Blonde'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/kim-k-bob-1.jpg'],
  10, '24 hours', 4.7, 0, 'active',
  true, true, 'Luxury Wig City',
  'Straight', 12, 180, '13x4 HD Lace', 'Honey Blonde', 'Human Hair', 'New'
),

-- 8. Burgundy Body Wave (26" burgundy waves, 13x6 HD lace)
(
  'Burgundy Body Wave',
  'Long burgundy body wave with deep wine highlights. 13x6 HD frontal, hand-tinted layer by layer. Drama, controlled.',
  285000, null, 'Colored Wigs',
  array['22"','24"','26"','28"'], array['Small','Medium','Large'], array['Burgundy'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/burgundy-body-wave-1.jpg'],
  5, '48-72 hours', 4.9, 0, 'active',
  true, true, 'Luxury Wig City',
  'Wavy', 26, 200, '13x6 HD Lace', 'Burgundy', 'Human Hair', 'Editor''s Pick'
),

-- 9. Copper Body Wave (28" copper waves, 13x6 HD lace)
(
  'Copper Body Wave',
  'Bold copper body wave that reads warm in any light. 13x6 HD lace, pre-plucked, baby hairs styled. Statement colour for confident wear.',
  315000, null, 'Colored Wigs',
  array['24"','26"','28"','30"'], array['Small','Medium','Large'], array['Custom'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/copper-body-wave-1.jpg'],
  4, '48-72 hours', 4.9, 0, 'active',
  true, true, 'Luxury Wig City',
  'Wavy', 28, 200, '13x6 HD Lace', 'Custom', 'Human Hair', 'Limited'
),

-- 10. Platinum Blonde Wavy (26" platinum waves, 13x6 HD lace)
(
  'Platinum Blonde Wavy',
  'Cool-toned platinum blonde with shadow roots. The hardest colour to perfect — done right. Numbered, signed, and certified.',
  365000, null, 'Colored Wigs',
  array['22"','24"','26"','28"'], array['Small','Medium','Large'], array['Custom'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/platinum-blonde-wavy-1.jpg'],
  3, '72-96 hours', 5.0, 0, 'active',
  true, true, 'Luxury Wig City',
  'Wavy', 26, 200, '13x6 HD Lace', 'Custom', 'Human Hair', 'Limited'
),

-- 11. Mocha Latte Wavy (26" mocha waves, 13x6 HD lace)
(
  'Mocha Latte Wavy',
  'Warm mocha latte tones with caramel highlights. Soft layered waves, 13x6 HD frontal. The everyday luxury that flatters every undertone.',
  275000, null, 'Frontal Wigs',
  array['22"','24"','26"','28"'], array['Small','Medium','Large'], array['Honey Blonde'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/mocha-latte-wavy-1.jpg'],
  6, '48-72 hours', 4.8, 0, 'active',
  true, true, 'Luxury Wig City',
  'Wavy', 26, 200, '13x6 HD Lace', 'Honey Blonde', 'Human Hair', 'Bestseller'
),

-- 12. Synthetic Bone Straight (30" synthetic black, 13x4 lace)
(
  'Synthetic Bone Straight',
  'Mirror-shine bone straight at an entry-level price. High-grade synthetic blend with a 13x4 lace front. The starter wig that doesn''t look like one.',
  95000, null, 'Bone Straight',
  array['24"','26"','28"','30"'], array['Small','Medium','Large'], array['Natural Black'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/platform/synthetic-bone-straight-1.jpg'],
  20, '24 hours', 4.5, 0, 'active',
  false, true, 'Luxury Wig City',
  'Straight', 30, 180, '13x4 HD Lace', 'Natural Black', 'Synthetic Blend', null
);
