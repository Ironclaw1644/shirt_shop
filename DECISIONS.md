# Georgia Print Hub — Engineering Decisions Log

Every professional default selected during the build lives here, alongside the reasoning. Update as decisions change.

## Stack

- **Framework:** Next.js 15.1 with the App Router, React 19, TypeScript strict mode.
- **Styling:** Tailwind CSS v3.4 + shadcn/ui primitives (radix-ui) + hand-written CSS modules for signature animations. Chose v3 over v4 for maximum shadcn/ecosystem compatibility.
- **Icons:** Font Awesome via `@fortawesome/react-fontawesome` (solid set loaded eagerly, brands only where needed). Lucide retained as lightweight fallback for admin utility icons.
- **Motion:** Framer Motion for component-scoped motion, GSAP for page-load hero choreography (scroll-trigger + morph). `prefers-reduced-motion` is honored at every layer.
- **Backend / DB / Auth / Storage:** Supabase (Postgres + RLS + Storage + Auth). Admin uses a custom `admin` claim on `profiles.role`.
- **Payments:** Stripe — embedded Payment Element on `/checkout` as primary path, hosted Checkout fallback via the `payment_mode` setting. Keys pending; build is complete and inert until env vars land.
- **Email:** Resend for transactional + newsletter (Audiences + Broadcasts). React Email templates.
- **Image Gen:** Google Gemini Nano Banana 2 — model id `gemini-2.5-flash-image`, accessed through `@google/genai`. Output is piped through `sharp` to WebP and cached in `public/images/generated/`.
- **Canvas Designer:** Fabric.js 6.
- **Forms:** React Hook Form + Zod resolvers. Zod schemas live under `lib/validators/`.
- **State:** Zustand for cart + designer state; TanStack Query for server state.
- **Hosting:** Vercel (frontend) + Supabase (backend).

## Brand Tokens

- Primary — ink crimson `#B8142B`
- Secondary — warm charcoal `#1A1A1A`
- Accent — press-gold `#D4A017`
- Paper — `#FAFAF7` with warm/cool variants
- Surface — `#E8E6E1`
- Success `#0E7C4A`, Warning `#C47A00`, Danger reuses primary scale

## Typography

- Display: **Inter Tight** (tight tracking on display sizes, unambiguous at 10rem+)
- Body: **Inter** (loaded as variable)
- Editorial accent: **Fraunces** (oversized hero subtitles, section eyebrows)
- Mono: **JetBrains Mono** (receipts, SKU readouts, admin tables)

All loaded via `next/font`, preloaded on critical pages, with `font-display: swap` fallbacks.

## Signature Animation System

- **Ink-press hero reveal:** headline renders three offset layers (cyan/magenta/yellow) that converge to clean crimson/black via `ink-stamp` keyframe. Triggered once on mount; `prefers-reduced-motion` short-circuits to a simple fade.
- **Capabilities marquee:** GPU-accelerated infinite translateX on a duplicated track, paused on hover, paper-grain backdrop via CSS radial-gradient.
- **Category tiles:** CSS 3D perspective tilt on hover (max 6° rotate), soft paper-shadow lift, layered "proof-stamp" badge that rotates in.
- **Volume counters:** IntersectionObserver-triggered number tick via `requestAnimationFrame`, eases out at tier breakpoints.
- **Cart drawer:** `paper-fold` keyframe (skewY 1° wind-down). Radix Dialog backs it; no custom portal logic.
- **Button primary:** Crimson fill with inner highlight, `wet-ink` keyframe animates background-position on hover for subtle sheen.
- **Perforated dividers:** `background-image: radial-gradient()` rendering dot rows — `bg-perforated-divider` utility.

## Data + Commerce Rules

- Prices are stored in cents. Display formatter lives in `lib/utils/money.ts`.
- Pricing tiers support boundaries at 25 / 50 / 100 / 250 / 500 / 1K / 5K / 10K+. Products without confirmed pricing carry `price_status = 'placeholder'` and surface a "Request Quote" CTA instead of a numeric price.
- Overlap products (e.g., 20 oz tumbler in Drinkware vs. Personalized Gifts) are separate rows with distinct copy + decoration emphasis and cross-linked at the PDP level.
- Admin-generated imagery records the original prompt to `media_assets` for regeneration parity.

## SEO

- Per-page Metadata API, JSON-LD LocalBusiness on homepage + contact, Product on every PDP, BreadcrumbList on deep pages.
- Dynamic sitemap enumerates categories + products + static pages.
- City-specific landing pages for Alpharetta, Roswell, Johns Creek, Milton, Cumming, and Atlanta. Each has unique, non-spammy copy and distinct hero imagery.

## Accessibility

- WCAG AA contrast baseline (tokens tested). Focus rings are ALWAYS visible — crimson ring on paper backgrounds, press-gold ring on dark backgrounds.
- Skip-to-content on every page; keyboard traps verified for Designer and Cart.
- `prefers-reduced-motion` disables the ink-press reveal, marquee, 3D tilt, counter animation, and paper-fold.

## Open Items (CLIENT_FILL)

- [ ] Business address, phone, email (homepage LocalBusiness, contact page, footer).
- [ ] Additional capability being finalized (About + capabilities marquee).
- [ ] Exact shipping zones + flat-rate numbers.
- [ ] Final return/refund + privacy policy language.
- [ ] Confirmed pricing for any product with `price_status = 'placeholder'`.
