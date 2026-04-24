# Georgia Print Hub (GAPH)

Production-grade e-commerce for a custom printing, promotional products, apparel, awards, personalized-gifts, and bulk-blanks shop — locally printed in Georgia. Eight consolidated storefronts in one site:

1. Custom Printing
2. Apparel & Headwear (blank + decorated, faceted by brand)
3. Corporate Awards
4. Drinkware
5. Custom Color Photo Gifts
6. Personalized Gifts
7. Sports & Academic Awards
8. Bulk Blanks (buy what we print on)

Built with **Next.js 15 (App Router) + React 19 + TypeScript**, styled with **Tailwind + shadcn primitives + hand-rolled signature animations**. Backend on **Supabase** (Postgres + RLS + Auth + Storage). Email via **Resend** (transactional + newsletter). In-browser Designer built on **Fabric.js 6**. Product + marketing imagery generated with **Google Gemini Nano Banana 2** (`gemini-2.5-flash-image`).

Checkout is invoice-based for v1: customers create an account, place an order, and receive an "order received, invoice coming soon" confirmation. Admin emails an itemized invoice from the order page. The prior Stripe Payment Element implementation is preserved on the `feature/stripe-checkout` branch (tag `pre-stripe-removal`) for future reactivation.

## Quickstart

```bash
npm install
cp .env.example .env.local  # fill in as keys arrive; everything is already wired
npm run dev                 # http://localhost:3000
```

The app runs locally without any live credentials — checkout records orders without payment and email calls no-op until `RESEND_API_KEY` is set.

## Environment

See `.env.example`. Key variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + SSR auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed scripts + admin handlers |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_ADMIN_EMAIL` | Transactional + newsletter email + admin invoice button |
| `GOOGLE_API_KEY` | Gemini image generation |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs + email templates |

## One-time setup

### 1. Supabase

1. Create a Supabase project → copy the URL, anon key, service role key into `.env.local`.
2. Install the CLI (`brew install supabase/tap/supabase`) and link: `supabase link --project-ref <ref>`.
3. Apply the schema: `supabase db push` (or paste `supabase/migrations/0001_init.sql` into the SQL editor).
4. Seed data: `npm run db:seed` — loads 8 categories + all subcategories + the seed products (additional ~120 SKUs are static in `lib/catalog/imported-products.ts`).
5. Storage buckets are created by the migration (`artwork`, `proofs`, `generated`, `product-images`). Tighten bucket-level policies in the Supabase dashboard as needed.

### 2. Checkout (invoice-based v1)

Customers create an account, place an order, and receive an "Order received — invoice coming soon" confirmation. No payment is collected at checkout.

To send an invoice:

1. Open the order at `/admin/orders/[id]`.
2. Optionally add notes (payment method, due date) in the sidebar form.
3. Click **Email invoice** — `emails/invoice.tsx` renders an itemized invoice with subtotal/shipping/tax/total and ships via Resend.

Reactivating Stripe later: see branch `feature/stripe-checkout` (tag `pre-stripe-removal`) for the prior Payment Element + webhook implementation.

### 3. Resend

1. Verify your sending domain in [resend.com](https://resend.com/domains).
2. Put the API key and verified sender into `.env.local`.
3. Newsletter subscribers use double opt-in — the welcome email fires from `/api/newsletter` and confirmation happens at `/api/newsletter/confirm`.
4. Admins compose broadcasts at `/admin/newsletter/new`; Resend Audiences/Broadcasts wiring is stubbed ready for your Audience ID.

### 4. Google Gemini (Nano Banana 2)

Already wired with the provided key.

- `npm run generate:images` — generate any missing hero/category/product/city images from `content/image-manifest.json` into `public/images/generated/`.
- `npm run generate:images -- --all` — regenerate every image.
- `npm run generate:images -- --regenerate <slug>` — regenerate just one.
- `npm run generate:images -- --filter <prefix>` — only slugs starting with the prefix (e.g. `--filter product-blank-`).
- `npm run generate:images -- --regenerate <slug> --reference <url>` — alter a real reference photo via Nano Banana 2 (image-to-image). Use when the rare branded item needs a real-photo basis instead of a generated look-alike.
- `npx tsx scripts/generate-manifest-entries.ts` — append manifest entries for any imported products that don't have one yet (idempotent).
- Admins can also generate images live from `/admin/products/[id]` → "Generate imagery".

Prompt writing discipline (baked into the script):

> Lead with subject + action. Specify lens / light. Describe environment + props. State mood and color grade. End with “photorealistic, ultra-detailed, commercial product photography” for photos; brand-consistent descriptors for illustrations. Brand-safe only.

## Surface map

```
/                                    # homepage (ink-press hero + 8-tile grid + counters + how-it-works)
/:category                           # category landing — every top-level slug (and every city slug)
/:category/:subcategory              # subcategory grid
/product/:slug                       # PDP with dual CTAs + tier pricing + decoration picker
/designer                            # Fabric.js customizer (product + placement query-stringed in)
/cart                                # standalone cart (drawer also available everywhere)
/checkout                            # email-only invoice flow ("order received, invoice coming soon")
/quote                               # volume quote flow
/search                              # catalog keyword search
/alpharetta-printing …               # 6 city SEO landings: Alpharetta, Roswell, Johns Creek, Milton, Cumming, Atlanta
/about, /contact, /faq               # static pages
/policies/{privacy,terms,returns,shipping}
/auth/{sign-in,sign-up,callback,sign-out}
/account                             # customer area — orders, proofs, designs, addresses, profile
/admin                               # admin back-end (protected by role=admin|staff)
  /admin/orders                      # list, detail, status transitions, "Email invoice" button
  /admin/quotes                      # inbox + reply + convert-to-order (then email invoice from order page)
  /admin/products                    # CRUD + Nano Banana generate panel
  /admin/customers                   # list, detail, order history
  /admin/newsletter                  # subscribers, campaigns (draft + Resend broadcast hook)
  /admin/activity                    # site_activity stream
  /admin/content, /admin/media       # content blocks + media library
  /admin/settings, /admin/users, /admin/audit
```

Admin keyboard shortcuts: `/` to focus search, `c` to create a new product.

## Signature UI

Design tokens live in `tailwind.config.ts` and `app/globals.css`. Named animations:

- `animate-ink-stamp` — ink-press hero headline reveal (CMYK offset resolving to clean)
- `animate-marquee` — capabilities strip
- `tile-3d` — 3D perspective tilt on category tiles, with proof-stamp badge
- `animate-paper-fold` — cart drawer easing
- `btn-wet-ink` — primary button with a crimson wet-ink shift on hover
- `perforated-bottom` / `perforated-top` — tear-off section dividers

`prefers-reduced-motion` is honored at every keyframe and at the tile-3d hover transform.

## Database

See `supabase/migrations/0001_init.sql` for the full schema:

- Core commerce: `products`, `product_variants`, `price_tiers`, `orders`, `order_items`, `proofs`, `order_messages`
- Customer: `profiles`, `addresses`, `customer_designs`
- Sales ops: `quote_requests`, `design_templates`
- Marketing: `newsletter_subscribers`, `newsletter_campaigns`
- Ops: `media_assets`, `site_activity`, `audit_log`, `settings`
- Enums: `price_status`, `product_status`, `order_status`, `proof_status`, `quote_status`, `user_role`, `media_source`

RLS is enabled on every table. Public users can read active catalog rows only; customers can read/write their own orders, designs, quotes, addresses; admins/staff (role claim via `profiles.role`) can do everything. The `is_admin()` SQL helper is the single gate.

## Testing

```bash
npm run typecheck     # strict TS
npm run lint          # next/core-web-vitals + typescript rules
npm run test          # vitest unit tests (see scripts dir)
```

## Deploying

- **Frontend**: Vercel — link the repo, set all env vars in the project settings.
- **Backend**: Supabase — `supabase db push` to apply migrations.
- **Domain**: point `gaprinthub.com` at Vercel, enable Vercel DNS, verify via Resend.

## Open items (tracked in `DECISIONS.md`)

- Final NAP details (street address, phone, hours) — edit `lib/site-config.ts` or set from `/admin/settings`.
- Additional capability copy (pending) — `<!-- CLIENT_FILL: additional capability -->` markers surface the exact spots.
- Shipping zone rates — `settings.shipping` JSON in the admin panel.
- Policy copy finalization — `app/(marketing)/policies/[slug]/page.tsx`.
- Any product rows with `priceStatus === "placeholder"` or `"quote"` need confirmed pricing.
