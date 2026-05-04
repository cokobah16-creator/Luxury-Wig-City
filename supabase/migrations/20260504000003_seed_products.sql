-- =====================================================================
-- LUXURY WIG CITY — Seed Catalogue Products
-- Migration: 20260504_000003_seed_products
-- =====================================================================
-- Idempotent seed of the original 8 mock wigs as platform-owned products
-- so the storefront isn't empty on first deploy. Vendor-uploaded products
-- (added via /vendor) sit alongside these without conflict.
-- =====================================================================

insert into public.products (
  name, description, price, discount_price, category,
  lengths, cap_sizes, colors, images,
  stock, delivery_time, rating, review_count, status,
  is_featured, is_platform_product, vendor_name,
  texture, length_inches, density, lace_type, primary_color, hair_type, badge
) values
  (
    'Abuja Silk',
    'Ultra-glossy bone straight, hand-tied 13x6 HD frontal. Pre-plucked hairline, baby hairs styled. Built for the woman who walks into a room and owns it.',
    285000, null, 'Bone Straight',
    array['22"','24"','26"','28"'], array['Small','Medium','Large'], array['Natural Black'],
    array[]::text[],
    8, '24-48 hours', 4.9, 412, 'active',
    true, true, 'Adaeze Hair Co.',
    'Straight', 26, 200, '13x6 HD Lace', 'Natural Black', 'Human Hair', 'Bestseller'
  ),
  (
    'Lagos Bone Straight',
    'Signature bone straight with mirror-shine finish. The everyday luxury that takes you from boardroom to dinner.',
    215000, null, 'Bone Straight',
    array['18"','20"','22"','24"'], array['Small','Medium','Large'], array['Natural Black'],
    array[]::text[],
    12, '24-48 hours', 4.8, 289, 'active',
    true, true, 'Chiamaka Hair',
    'Straight', 22, 180, '13x4 HD Lace', 'Natural Black', 'Human Hair', 'Bestseller'
  ),
  (
    'Wuse Pixie Curls',
    'Bouncy pixie curls with all-day hold. Glueless wear-and-go construction — secure in 30 seconds.',
    165000, null, 'Pixie Curl',
    array['12"','14"','16"'], array['Small','Medium','Large'], array['Natural Black'],
    array[]::text[],
    15, '24 hours', 4.9, 156, 'active',
    true, true, 'Folake Beauty',
    'Curly', 14, 180, '5x5 Closure', 'Natural Black', 'Human Hair', 'New'
  ),
  (
    'Bohemian Dream',
    'Cascading bohemian curls. The wedding-season favourite. Custom lace tinted to your skin tone.',
    245000, null, 'Frontal Wigs',
    array['22"','24"','26"'], array['Small','Medium','Large'], array['Natural Black'],
    array[]::text[],
    6, '48-72 hours', 5.0, 203, 'active',
    true, true, 'Adaeze Hair Co.',
    'Curly', 24, 200, '13x6 HD Lace', 'Natural Black', 'Human Hair', 'Editor''s Pick'
  ),
  (
    'Asaba Honey',
    'Sun-kissed honey blonde body wave. Hand-painted highlights. Made to turn heads in Lagos golden hour.',
    195000, null, 'Closure Wigs',
    array['18"','20"','22"'], array['Small','Medium','Large'], array['Honey Blonde'],
    array[]::text[],
    10, '48-72 hours', 4.7, 98, 'active',
    false, true, 'Nneka Wigs Ltd.',
    'Wavy', 20, 180, '5x5 Closure', 'Honey Blonde', 'Human Hair', null
  ),
  (
    'Royal Burgundy',
    'Custom-coloured burgundy. Limited monthly drop. Numbered, signed, and certified by our master colorist.',
    275000, null, 'Frontal Wigs',
    array['22"','24"'], array['Small','Medium'], array['Burgundy'],
    array[]::text[],
    3, '72-96 hours', 4.9, 67, 'active',
    true, true, 'Chiamaka Hair',
    'Straight', 24, 200, '13x4 HD Lace', 'Burgundy', 'Human Hair', 'Limited'
  ),
  (
    'Queen Braids',
    'Box-braided full lace wig. Pre-installed, glueless, and lasts 6+ weeks of consistent wear.',
    145000, null, 'Braided Wigs',
    array['24"','28"','30"'], array['Small','Medium','Large'], array['Natural Black'],
    array[]::text[],
    9, '24-48 hours', 4.6, 134, 'active',
    false, true, 'Folake Beauty',
    'Kinky', 28, 150, 'Full Lace', 'Natural Black', 'Synthetic Blend', null
  ),
  (
    'Nile Waves',
    'Soft Egyptian-inspired body wave. Hand-tied frontal. Bridal-grade luxury.',
    225000, null, 'Frontal Wigs',
    array['22"','24"','26"','28"'], array['Small','Medium','Large'], array['Natural Black'],
    array[]::text[],
    7, '48-72 hours', 4.9, 178, 'active',
    false, true, 'Adaeze Hair Co.',
    'Wavy', 26, 200, '13x6 HD Lace', 'Natural Black', 'Human Hair', null
  )
on conflict do nothing;
