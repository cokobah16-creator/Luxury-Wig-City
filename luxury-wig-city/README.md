# Luxury Wig City — Frontend

> **Because Your Hair Is The Crown.**
> Premium Nigerian wig marketplace · Vite + React 18 + TypeScript + Tailwind CSS

---

## Quickstart

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

To build for production:

```bash
npm run build
npm run preview
```

---

## What's in this build

A complete, production-ready frontend for Luxury Wig City covering all 9 surface areas:

| Route | Page |
|---|---|
| `/` | Home — hero, categories, best sellers, why us, delivery, WhatsApp CTA |
| `/shop` | Shop with filter sidebar (category · texture · length · price · lace · color) |
| `/shop/:id` | Product detail — gallery, attributes, qty, add to cart, AI try-on, WhatsApp |
| `/try-on` | AI Try-On — photo upload, wig selection, preview, save look |
| `/cart` | Cart with qty controls, subtotal, free Abuja delivery threshold |
| `/checkout` | Checkout — contact, delivery, payment options |
| `/location` | Abuja showroom + delivery zone coverage |
| `/contact` | Contact form, WhatsApp, Instagram, Email |
| `/account` | Login/Register, order history, saved wigs, try-on looks |
| `/admin` | Admin dashboard — overview, products, orders, customers, deliveries |

---

## Brand system

All brand tokens live in `tailwind.config.js`. Strict adherence to Precious's identity guide:

- **Burgundy** `#800020` — primary
- **Gold** `#FFD700` — accent
- **Off White** `#FDFFFC` — base
- **Pearl** `#F8F5EE` — soft surface
- **Ash · Smoke · Black** — supporting greys

Typography:
- **Italiana** — `font-wordmark` for the logo (closest free-font approximation of the custom decorative serif)
- **Anton** — `font-display` for "Because Your Hair Is The Crown" heavy display
- **Cormorant Garamond** — `font-serif` for editorial italic copy
- **DM Sans** — `font-sans` for body and UI

The brand mascot lives in `src/components/Logo.tsx` as a pure SVG component with 5 colour variants (`burgundy-on-gold`, `gold-on-burgundy`, `gold-on-dark`, `mono-burgundy`, `mono-gold`). The wordmark is in `src/components/Wordmark.tsx`.

---

## Project structure

```
luxury-wig-city/
├── public/
│   └── favicon.svg              # mini medallion
├── src/
│   ├── main.tsx                 # entry — BrowserRouter
│   ├── App.tsx                  # routes
│   ├── index.css                # Tailwind + CSS vars + animations
│   ├── components/
│   │   ├── Layout.tsx           # Navbar + Outlet + Footer + WhatsApp FAB
│   │   ├── Navbar.tsx           # sticky, blurs on scroll, mobile drawer
│   │   ├── Footer.tsx           # 5 columns, "Your Hair's BFF" tagline
│   │   ├── Logo.tsx             # SVG mascot, 5 variants
│   │   ├── Wordmark.tsx         # "luxury wigs" stacked logotype
│   │   ├── Button.tsx           # primary · secondary · ghost · gold variants
│   │   └── ProductCard.tsx      # editorial card with hover state
│   ├── pages/                   # 10 route files, see table above
│   └── data/
│       └── wigs.ts              # 8 mock wigs + formatNaira utility
├── tailwind.config.js           # brand tokens
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase 2 — Backend (Supabase)

This frontend was built with Supabase wiring in mind. The shape:

```
supabase tables
├── wigs              (id, name, price, vendor_id, images[], attrs jsonb, …)
├── vendors           (id, name, location, verified, rating, …)
├── users             (id, email, phone, name, …)
├── orders            (id, user_id, items jsonb, total, status, address, …)
├── cart_items        (id, user_id, wig_id, qty)
├── try_on_looks      (id, user_id, wig_id, photo_url, generated_url)
└── delivery_zones    (id, name, fee, eta)
```

Auth: Supabase Auth with email/phone + OAuth (Google) — replaces the mock in `Account.tsx`.
Storage: Supabase Storage bucket for vendor product photos and user try-on uploads.
Realtime: subscribe to `orders` table in `Admin.tsx` for the live dashboard.

## Phase 3 — AI Wig Try-On

Architecture: replace `TryOn.tsx` placeholder logic with:
1. Upload user selfie → Supabase Storage
2. Trigger Edge Function → calls Replicate / Banana / fal.ai with face detection + wig overlay model (e.g. SAM segmentation + ControlNet inpaint)
3. Return generated image URL → render in preview area
4. Save to `try_on_looks` table for the user's saved looks gallery

## Phase 4 — Payments

- **Paystack** — primary card/bank gateway for Nigerian customers
- **Flutterwave** — secondary, supports USSD + mobile money
- **Bank transfer + WhatsApp confirm** — already wired in the UI

Replace the radio buttons in `Checkout.tsx` with the Paystack / Flutterwave inline JS components.

---

## Notes

- All product images currently use stylised SVG placeholders (the brand mascot on burgundy gradient backgrounds). When Precious has vendor product photography, swap the placeholder block in `ProductCard.tsx` for `<img src={wig.images[0]} />`.
- The map on `/location` is a stylised placeholder — Google Maps / Mapbox swap-in is a 10-line change.
- WhatsApp number `+234 800 000 0000` is a placeholder — search and replace `2348000000000` across the project to update.
- Admin auth is currently open access — gate `/admin` behind a role check once Supabase Auth is wired.

---

Made with ✦ in Nigeria.
