/**
 * Inspect the orphan DB products for catalog-readiness:
 *  - do they have images?
 *  - do they have base prices?
 *  - do they have subcategories?
 *  - do they have brands / descriptions?
 *
 * Outputs aggregate completeness stats (no full row dumps) so we know whether
 * promoting them to the public site will look polished or broken.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { sampleProducts } from "../lib/catalog/sample-products";

async function main() {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false }, db: { schema: "gaph" } },
  );

  const staticSlugs = new Set(sampleProducts.map((p) => p.slug));

  // Pull all DB products with all the fields we'd need for sample-products.ts.
  const rows: {
    id: string;
    slug: string;
    title: string;
    brand: string | null;
    short_description: string | null;
    description: string | null;
    base_price_cents: number | null;
    min_qty: number;
    lead_time_days: number;
    images: string[] | null;
    options: unknown;
    decoration_methods: string[] | null;
    badges: string[] | null;
    placement_zones: unknown;
    category_id: string | null;
    subcategory_id: string | null;
    price_status: string;
  }[] = [];
  const PAGE = 1000;
  for (let from = 0; from < 50000; from += PAGE) {
    const { data, error } = await supa
      .from("products")
      .select("id, slug, title, brand, short_description, description, base_price_cents, min_qty, lead_time_days, images, options, decoration_methods, badges, placement_zones, category_id, subcategory_id, price_status")
      .range(from, from + PAGE - 1);
    if (error) { console.error(error); process.exit(1); }
    if (!data || data.length === 0) break;
    rows.push(...(data as never[]));
    if (data.length < PAGE) break;
  }

  const { data: cats } = await supa
    .from("categories")
    .select("id, slug, name, parent_id");
  const catById = new Map((cats ?? []).map((c) => [c.id, c]));

  const orphans = rows.filter((r) => !staticSlugs.has(r.slug));

  let hasImage = 0, hasPrice = 0, hasSub = 0, hasBrand = 0, hasDesc = 0, hasShortDesc = 0, hasDecMethods = 0;
  const subDistrib = new Map<string, number>();
  for (const o of orphans) {
    if (Array.isArray(o.images) && o.images.length > 0 && o.images[0]) hasImage++;
    if (o.base_price_cents != null && o.base_price_cents > 0) hasPrice++;
    if (o.subcategory_id) {
      hasSub++;
      const sub = catById.get(o.subcategory_id);
      const k = sub?.name ?? "(unknown sub)";
      subDistrib.set(k, (subDistrib.get(k) ?? 0) + 1);
    }
    if (o.brand) hasBrand++;
    if (o.description) hasDesc++;
    if (o.short_description) hasShortDesc++;
    if (Array.isArray(o.decoration_methods) && o.decoration_methods.length > 0) hasDecMethods++;
  }

  console.log(`Orphans: ${orphans.length}\n`);
  console.log(`COMPLETENESS:`);
  console.log(`  has image:               ${hasImage}/${orphans.length}`);
  console.log(`  has base_price > 0:      ${hasPrice}/${orphans.length}`);
  console.log(`  has subcategory_id:      ${hasSub}/${orphans.length}`);
  console.log(`  has brand:               ${hasBrand}/${orphans.length}`);
  console.log(`  has description:         ${hasDesc}/${orphans.length}`);
  console.log(`  has short_description:   ${hasShortDesc}/${orphans.length}`);
  console.log(`  has decoration_methods:  ${hasDecMethods}/${orphans.length}\n`);

  console.log(`SUBCATEGORY DISTRIBUTION (DB):`);
  for (const [k, v] of [...subDistrib.entries()].sort((a,b) => b[1]-a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  // Show 1 sample orphan in full (slug + key fields) so we can see what a generated entry would look like
  console.log(`\nSAMPLE (first orphan):`);
  const s = orphans[0];
  if (s) {
    const cat = s.category_id ? catById.get(s.category_id) : null;
    const sub = s.subcategory_id ? catById.get(s.subcategory_id) : null;
    console.log(`  slug:           ${s.slug}`);
    console.log(`  title:          ${s.title}`);
    console.log(`  brand:          ${s.brand ?? "—"}`);
    console.log(`  category:       ${cat?.name ?? "—"} (${cat?.slug ?? "?"})`);
    console.log(`  subcategory:    ${sub?.name ?? "—"} (${sub?.slug ?? "?"})`);
    console.log(`  base_price_c:   ${s.base_price_cents ?? "null"}`);
    console.log(`  min_qty:        ${s.min_qty}`);
    console.log(`  lead_time:      ${s.lead_time_days}`);
    console.log(`  images:         ${Array.isArray(s.images) ? `[${s.images.length} url(s), first: ${s.images[0]?.slice(0, 80) ?? "?"}…]` : "null"}`);
    console.log(`  short_desc:     ${s.short_description?.slice(0, 80) ?? "—"}`);
    console.log(`  price_status:   ${s.price_status}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
