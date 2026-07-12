import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Compact demo dataset for the demo_gaph schema — used by /api/demo/reset.
 *
 * Column names mirror supabase/migrations/0002_gaph_schema.sql exactly.
 * Product slugs are REAL slugs from the static catalog (lib/catalog), so
 * admin → storefront links resolve. profiles.id is TEXT in the demo schema
 * (no auth.users FK — see supabase/demo-schema.sql), which lets the synthetic
 * demo admin exist without ever touching Supabase Auth.
 *
 * The full production seed (lib/catalog/seed-supabase.ts) upserts 7,000+
 * products — far too heavy for a nightly cron reset, hence this compact
 * hand-rolled set (8 products / 3 categories / 3 orders / 2 quotes /
 * 2 customers + the demo admin).
 */

export const DEMO_ADMIN_ID = "00000000-0000-0000-0000-00000000demo";
const CUSTOMER_1 = "11111111-1111-4111-8111-111111111111";
const CUSTOMER_2 = "22222222-2222-4222-8222-222222222222";

// Tables the reset wipes, children before parents (FK-safe order).
const WIPE_ORDER = [
  "order_messages",
  "proofs",
  "order_items",
  "orders",
  "price_tiers",
  "product_variants",
  "customer_designs",
  "design_templates",
  "quote_requests",
  "newsletter_campaigns",
  "newsletter_subscribers",
  "site_activity",
  "audit_log",
  "media_assets",
  "addresses",
  "products",
  "categories",
  "profiles",
] as const;

const img = (slug: string) => [`/images/generated/product-${slug}.webp`];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resetDemoData(db: SupabaseClient<any, any, any>) {
  // ── wipe ──────────────────────────────────────────────────────────────────
  for (const table of WIPE_ORDER) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error) throw new Error(`wipe ${table}: ${error.message}`);
  }

  // ── profiles: demo admin + 2 customers ───────────────────────────────────
  const { error: profErr } = await db.from("profiles").insert([
    {
      id: DEMO_ADMIN_ID,
      email: "demo@walkperro.com",
      full_name: "demo admin",
      role: "admin",
    },
    {
      id: CUSTOMER_1,
      email: "maria@peachtreeevents.com",
      full_name: "Maria Delgado",
      company: "Peachtree Events Co.",
      phone: "404-555-0148",
      role: "customer",
    },
    {
      id: CUSTOMER_2,
      email: "coach.harris@northgaathletics.org",
      full_name: "Doug Harris",
      company: "North GA Athletics",
      phone: "706-555-0193",
      role: "customer",
    },
  ]);
  if (profErr) throw new Error(`profiles: ${profErr.message}`);

  // ── categories ───────────────────────────────────────────────────────────
  const { data: cats, error: catErr } = await db
    .from("categories")
    .insert([
      { slug: "custom-printing", name: "Custom Printing", sort_order: 0 },
      { slug: "drinkware", name: "Drinkware", sort_order: 1 },
      { slug: "personalized-gifts", name: "Personalized Gifts", sort_order: 2 },
    ])
    .select("id, slug");
  if (catErr || !cats) throw new Error(`categories: ${catErr?.message}`);
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id])) as Record<
    string,
    string
  >;

  // ── products (real static-catalog slugs) ─────────────────────────────────
  const { data: products, error: prodErr } = await db
    .from("products")
    .insert([
      {
        slug: "standard-business-cards",
        category_id: catId["custom-printing"],
        title: "Standard Business Cards",
        short_description:
          "Sturdy 14pt premium cardstock — full-color and built for handing out.",
        images: img("standard-business-cards"),
        base_price_cents: 100,
        price_status: "confirmed",
        min_qty: 1,
        lead_time_days: 3,
        decoration_methods: ["digital-print", "offset-print"],
        badges: ["Fast Turnaround"],
        status: "active",
      },
      {
        slug: "full-color-flyers",
        category_id: catId["custom-printing"],
        title: "Full-Color Flyers",
        short_description: "Vivid full-color flyers on gloss or matte text stock.",
        images: img("full-color-flyers"),
        base_price_cents: 55,
        price_status: "confirmed",
        min_qty: 25,
        lead_time_days: 3,
        decoration_methods: ["digital-print"],
        status: "active",
      },
      {
        slug: "tri-fold-brochures",
        category_id: catId["custom-printing"],
        title: "Tri-Fold Brochures",
        short_description: "Classic 8.5×11 tri-folds, crisp scores, full color.",
        images: img("tri-fold-brochures"),
        base_price_cents: 89,
        price_status: "confirmed",
        min_qty: 25,
        lead_time_days: 4,
        decoration_methods: ["digital-print", "offset-print"],
        status: "active",
      },
      {
        slug: "kiss-cut-stickers",
        category_id: catId["custom-printing"],
        title: "Kiss-Cut Stickers",
        short_description: "Any shape, weatherproof vinyl, kiss-cut on backing.",
        images: img("kiss-cut-stickers"),
        base_price_cents: 120,
        price_status: "confirmed",
        min_qty: 25,
        lead_time_days: 4,
        decoration_methods: ["digital-print"],
        badges: ["Popular"],
        status: "active",
      },
      {
        slug: "yard-signs",
        category_id: catId["custom-printing"],
        title: "Custom Yard Signs",
        short_description: "18×24 corrugated plastic with H-stakes, full color.",
        images: img("yard-signs"),
        base_price_cents: 1499,
        price_status: "confirmed",
        min_qty: 1,
        lead_time_days: 3,
        decoration_methods: ["digital-print"],
        status: "active",
      },
      {
        slug: "take-out-menus",
        category_id: catId["custom-printing"],
        title: "Take-Out Menus",
        short_description: "Restaurant take-out menus, folded or flat, built to reprint fast.",
        images: img("take-out-menus"),
        base_price_cents: 45,
        price_status: "confirmed",
        min_qty: 100,
        lead_time_days: 4,
        decoration_methods: ["digital-print", "offset-print"],
        status: "active",
      },
      {
        slug: "photo-mug",
        category_id: catId["drinkware"],
        title: "Photo Mug",
        short_description: "11oz ceramic mug, full-wrap dye-sub photo print.",
        images: img("photo-mug"),
        base_price_cents: 1099,
        price_status: "confirmed",
        min_qty: 1,
        lead_time_days: 5,
        decoration_methods: ["sublimation"],
        status: "active",
      },
      {
        slug: "monogram-acacia-cutting-board",
        category_id: catId["personalized-gifts"],
        title: "Monogram Acacia Round Board",
        short_description: "Laser-engraved acacia serving board — wedding-gift staple.",
        images: img("monogram-acacia-cutting-board"),
        base_price_cents: 4200,
        price_status: "confirmed",
        min_qty: 1,
        lead_time_days: 6,
        decoration_methods: ["laser-engraving"],
        badges: ["Gift Ready"],
        status: "active",
      },
    ])
    .select("id, slug");
  if (prodErr || !products) throw new Error(`products: ${prodErr?.message}`);
  const prodId = Object.fromEntries(
    products.map((p) => [p.slug, p.id]),
  ) as Record<string, string>;

  // ── price tiers (business cards + stickers) ──────────────────────────────
  const { error: tierErr } = await db.from("price_tiers").insert([
    { product_id: prodId["standard-business-cards"], min_qty: 1, max_qty: 99, unit_price_cents: 100 },
    { product_id: prodId["standard-business-cards"], min_qty: 100, max_qty: 249, unit_price_cents: 15 },
    { product_id: prodId["standard-business-cards"], min_qty: 250, max_qty: 499, unit_price_cents: 10 },
    { product_id: prodId["standard-business-cards"], min_qty: 500, max_qty: null, unit_price_cents: 6 },
    { product_id: prodId["kiss-cut-stickers"], min_qty: 25, max_qty: 99, unit_price_cents: 120 },
    { product_id: prodId["kiss-cut-stickers"], min_qty: 100, max_qty: 499, unit_price_cents: 60 },
    { product_id: prodId["kiss-cut-stickers"], min_qty: 500, max_qty: null, unit_price_cents: 32 },
  ]);
  if (tierErr) throw new Error(`price_tiers: ${tierErr.message}`);

  // ── orders: three, in different statuses ─────────────────────────────────
  const { data: orders, error: orderErr } = await db
    .from("orders")
    .insert([
      {
        user_id: CUSTOMER_1,
        email: "maria@peachtreeevents.com",
        status: "received",
        subtotal_cents: 6000,
        shipping_cents: 900,
        total_cents: 6900,
        notes: "Event is the 28th — rush if possible.",
      },
      {
        user_id: CUSTOMER_2,
        email: "coach.harris@northgaathletics.org",
        status: "in_proof",
        subtotal_cents: 32000,
        shipping_cents: 0,
        total_cents: 32000,
        notes: "Team logo attached, gold on navy.",
      },
      {
        user_id: null,
        email: "walkups@example.com",
        status: "shipped",
        subtotal_cents: 10990,
        shipping_cents: 1200,
        total_cents: 12190,
      },
    ])
    .select("id, status");
  if (orderErr || !orders) throw new Error(`orders: ${orderErr?.message}`);

  const byStatus = Object.fromEntries(orders.map((o) => [o.status, o.id])) as Record<string, string>;
  const { error: itemErr } = await db.from("order_items").insert([
    {
      order_id: byStatus["received"],
      product_id: prodId["standard-business-cards"],
      title_snapshot: "Standard Business Cards",
      quantity: 500,
      unit_price_cents: 6,
      proof_status: "pending",
    },
    {
      order_id: byStatus["received"],
      product_id: prodId["full-color-flyers"],
      title_snapshot: "Full-Color Flyers",
      quantity: 100,
      unit_price_cents: 30,
      proof_status: "pending",
    },
    {
      order_id: byStatus["in_proof"],
      product_id: prodId["kiss-cut-stickers"],
      title_snapshot: "Kiss-Cut Stickers",
      quantity: 1000,
      unit_price_cents: 32,
      proof_status: "pending",
    },
    {
      order_id: byStatus["shipped"],
      product_id: prodId["photo-mug"],
      title_snapshot: "Photo Mug",
      quantity: 10,
      unit_price_cents: 1099,
      proof_status: "approved",
    },
  ]);
  if (itemErr) throw new Error(`order_items: ${itemErr.message}`);

  // ── quotes: two, different stages ────────────────────────────────────────
  const { error: quoteErr } = await db.from("quote_requests").insert([
    {
      user_id: CUSTOMER_2,
      email: "coach.harris@northgaathletics.org",
      full_name: "Doug Harris",
      company: "North GA Athletics",
      est_quantity: 5000,
      decoration: "screen-print",
      message: "5,000 booster stickers for the fall season — need pricing tiers.",
      status: "new",
    },
    {
      user_id: null,
      email: "info@bluebirdcafe.example.com",
      full_name: "Renee Walker",
      company: "Bluebird Cafe",
      est_quantity: 250,
      decoration: "digital-print",
      message: "250 laminated take-out menus, new brand colors.",
      status: "quoted",
      admin_reply: "Quoted at $0.85/unit laminated — 4 business days from proof approval.",
      quoted_price_cents: 21250,
    },
  ]);
  if (quoteErr) throw new Error(`quote_requests: ${quoteErr.message}`);

  // ── light dressing: newsletter + activity ────────────────────────────────
  await db.from("newsletter_subscribers").insert([
    { email: "maria@peachtreeevents.com", full_name: "Maria Delgado", subscribed_at: new Date().toISOString(), confirmed_at: new Date().toISOString() },
    { email: "print.nerd@example.com", subscribed_at: new Date().toISOString() },
  ]);
  await db.from("site_activity").insert([
    { event_type: "pageview", path: "/", user_id: null, metadata: { seeded: true } },
    { event_type: "order_created", path: "/checkout", user_id: null, metadata: { seeded: true } },
  ]);

  return {
    profiles: 3,
    categories: cats.length,
    products: products.length,
    orders: orders.length,
    quotes: 2,
  };
}
