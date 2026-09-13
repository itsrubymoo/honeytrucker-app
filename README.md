# honeytrucker app

The honeytrucker membership platform — free and paywalled resources, audio, video, and
courses. Next.js (App Router), Supabase (auth + Postgres), Stripe (membership billing,
via the Stripe account behind Flodesk Checkout), and Mux (audio/video).

This is a separate project from the `honeytrucker` landing-page repo (the static
marketing site for individual cohorts like "The Seasonal Shift").

## One-time setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration in `supabase/migrations/0001_init.sql` against it (via the SQL
   editor, or the Supabase CLI: `supabase db push`).
3. Open `supabase/migrations/0001_init.sql` and check the `admin_emails` array inside
   `handle_new_user()` — it should list your email. Edit and re-run if not.
4. Copy the Project URL, anon key, and service role key (Project Settings → API) into
   `.env.local` (copy `.env.local.example` to start).

### 2. Stripe

Flodesk Checkout requires a connected Stripe Standard account — use that same account
here so membership status is shared.

1. Grab the account's secret key (`sk_...`) → `STRIPE_SECRET_KEY`.
2. Dashboard → Developers → Webhooks → add an endpoint at
   `https://<your-domain>/api/stripe/webhook`, and select these events:
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`.
3. Copy the endpoint's signing secret → `STRIPE_WEBHOOK_SECRET`.
4. If you ever sell something else through this same Stripe account, list the price
   IDs that should actually count as membership in `MEMBER_PRICE_IDS` (comma-separated).
   Leave blank while membership is the only product.

### 3. Mux

Create a new signing key (System Settings → Signing Keys — separate from anything used
by the landing-page repo) → `MUX_SIGNING_KEY_ID` / `MUX_SIGNING_KEY_PRIVATE`.

When uploading content in the Mux dashboard: use a **public** playback policy for
free-tier audio/video, **signed** for member-tier. Paste the resulting Playback ID into
the item's admin form here.

### 4. Everything else

- `NEXT_PUBLIC_FLODESK_CHECKOUT_URL` — your Flodesk Checkout page, linked from `/account`
  and locked-content cards.
- `NEXT_PUBLIC_SITE_URL` — this app's deployed URL.
- Set Flodesk Checkout's post-purchase redirect to `<your-domain>/welcome`.

Set all of the above as Vercel Environment Variables (Production + Preview) once
deployed, and in `.env.local` for local dev.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` (magic link,
sent via Supabase Auth) — the email in `handle_new_user()`'s admin list gets the admin
role automatically and can reach `/admin` to add content and courses.

## How content access works

- `content_items` (resources/audio/video) and `courses`/`course_lessons` each have a
  `tier`: `free` or `member`.
- Row-level security enforces this at the database level — a signed-in non-member
  simply cannot select the gated fields (Mux playback ID, file URL, lesson body) for
  member-tier rows. The `*_public` views expose safe metadata only, so locked items
  still show up as a card with a 🔒 and a link to join, instead of disappearing.
- Video/audio playback for member-tier content goes through
  `app/api/mux/playback-token`, which re-checks membership server-side before signing
  a short-lived Mux token.

## Deploy

Same as the landing-page repo: import into [vercel.com/new](https://vercel.com/new),
framework preset **Next.js**, add the environment variables above, deploy. Every push
to `main` redeploys.
