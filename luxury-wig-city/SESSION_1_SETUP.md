# Session 1 — Supabase Setup Guide

This is your runbook for getting Session 1 wired up. Should take **15-20 minutes** end to end.

---

## What Session 1 ships

- All 14 entity tables from the spec (`profiles`, `vendor_profiles`, `products`, `orders`, `cart_items`, `wishlist_items`, `reviews`, `messages`, `notifications`, `announcements`, `flash_sales`, `ip_violations`, `custom_wig_requests`, `user_wigs`, `community_posts` + `community_post_likes`)
- Full Row Level Security: customers see their own data, vendors see their store, admins see everything
- Auto-triggers: profile creation on signup, role promotion on vendor approval, rating recompute on review, like counter sync
- Full-text search on products (`pg_trgm` + `tsvector` + GIN index)
- 4 storage buckets: `product-images`, `vendor-documents`, `vendor-branding`, `user-uploads`
- Typed Supabase client + AuthProvider with email/password, Google OAuth, magic link
- Updated Account page using real auth

---

## Prerequisites

1. **A Supabase account.** [supabase.com](https://supabase.com) — free tier is fine for now (500MB DB, 1GB storage, 50K MAU). Upgrade to Pro ($25/mo) when Precious has 1000+ customers.

---

## Step 1 — Create the Supabase project

1. Sign in to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. **Name:** `luxury-wig-city`
4. **Database password:** generate a strong one and save it to 1Password (you won't need it day-to-day, but you'll want it if you ever connect via psql)
5. **Region:** `eu-west-1` (Ireland) — closest to Nigeria, lowest latency for your customers
6. **Pricing plan:** Free
7. Click **Create new project** and wait ~2 minutes for provisioning

---

## Step 2 — Grab the keys

Once provisioned:

1. Go to **Settings → API**
2. Copy **Project URL** → paste into `.env.local` as `VITE_SUPABASE_URL`
3. Copy **anon public** key → paste as `VITE_SUPABASE_ANON_KEY`
4. The **service_role** key is secret — never put it in `.env.local` or any client-side code. We'll use it only for Edge Functions later.

```bash
cp .env.example .env.local
# then edit .env.local with real values
```

---

## Step 3 — Run the migrations

Three files in `supabase/migrations/`. Run them in order via the SQL editor:

1. Go to **SQL Editor → New query**
2. Open `supabase/migrations/20260430000001_initial_schema.sql` from this project, copy the whole file, paste into the editor, click **Run**. Should see "Success. No rows returned." Wait for it to complete (~5 seconds).
3. Open `supabase/migrations/20260430000002_rls_policies.sql`, paste, run.
4. Open `supabase/migrations/20260430000003_storage_and_seed.sql`, paste, run.

Verify under **Table Editor** — you should see 16 tables and 4 storage buckets.

> **Optional but recommended:** install the [Supabase CLI](https://supabase.com/docs/guides/cli) so you can run `supabase db push` instead of pasting SQL by hand. Once linked: `supabase link --project-ref <your-ref>` then `supabase db push`. Future migrations just drop into `supabase/migrations/` and push.

---

## Step 4 — Configure auth

1. **Authentication → Providers → Email** is enabled by default. Toggle **Confirm email** OFF for now (development) — you'll re-enable in production.
2. **Authentication → Providers → Google**: toggle on, get OAuth credentials from Google Cloud Console:
   - Go to [console.cloud.google.com](https://console.cloud.google.com) → create OAuth 2.0 Client ID (Web application)
   - Authorised redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Paste Client ID + Client Secret into Supabase
3. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:5173` (for dev) or your Vercel URL (for prod)
   - Redirect URLs: add both `http://localhost:5173/account` and your Vercel URL `/account`

---

## Step 5 — Create the first admin user

Supabase Auth treats everyone as a `customer` by default. To bootstrap admin (you, Precious):

1. Sign up in the app at `/account` with your email.
2. Go back to Supabase dashboard → **Table Editor → profiles**.
3. Find your row, change `role` from `customer` to `admin`, save.
4. Refresh the app — you should now see admin nav links.

---

## Step 6 — Run the app

```bash
npm install
npm run dev
```

Visit `localhost:5173/account`, register a test customer, sign in. The Welcome Back screen should render.

---

## Troubleshooting

**"Auth session missing!"** — your `.env.local` isn't loaded. Restart `npm run dev` after editing it.

**"new row violates row-level security policy"** — you're probably trying to insert with the wrong role. Check that the user's `profiles.role` is set correctly in the Table Editor.

**Can't sign in with Google** — most likely the redirect URI in Google Cloud Console doesn't match exactly. It must be `https://<project-ref>.supabase.co/auth/v1/callback` — note `https://` and the trailing path.

**Migration fails on `pg_trgm`** — run `create extension if not exists pg_trgm;` first as a separate query, then re-run the migration.

---

## What's next — Session 2

Once Session 1 is live, Session 2 wires the marketplace core to real data:

- Replace `src/data/wigs.ts` mock data with `useQuery(supabase.from('products')...)` everywhere
- Shop page: real-time filtering and search via the `search_vector` column we set up
- Product detail: real reviews, real stock, "add to cart" actually inserts a `cart_items` row
- Cart: live `useQuery` against `cart_items` for current user, qty mutations
- Checkout: creates real `orders` row, splits multi-vendor carts into N orders, integrates Flutterwave inline checkout
- Order confirmation page reads real order
- Order tracking page reads real `tracking_updates`

Tell me when you've got Step 1-5 done and I'll ship Session 2.
