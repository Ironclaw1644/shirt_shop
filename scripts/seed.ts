/**
 * Seeds categories, subcategories, and representative products into Supabase.
 * Run with:
 *   npm run db:seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { categories } from "../lib/catalog/categories";
import { sampleProducts } from "../lib/catalog/sample-products";
import type { Database } from "../types/supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });

async function seedCategories() {
  const topLevel: Record<string, string> = {};
  for (const [idx, c] of categories.entries()) {
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        {
          slug: c.slug,
          name: c.name,
          parent_id: null,
          intro: c.intro,
          sort_order: idx,
          seo_meta: {
            eyebrow: c.eyebrow,
            tagline: c.tagline,
            heroPromptKey: c.heroPromptKey,
          } as never,
        },
        { onConflict: "slug" },
      )
      .select("id, slug")
      .single();
    if (error) throw error;
    topLevel[data.slug] = data.id;

    for (const [subIdx, s] of c.subcategories.entries()) {
      const { error: subErr } = await supabase.from("categories").upsert(
        {
          slug: `${c.slug}--${s.slug}`,
          name: s.name,
          parent_id: data.id,
          intro: s.blurb ?? null,
          sort_order: subIdx,
        },
        { onConflict: "slug" },
      );
      if (subErr) throw subErr;
    }
  }
  return topLevel;
}

async function seedProducts(catIds: Record<string, string>) {
  for (const p of sampleProducts) {
    const categoryId = catIds[p.categorySlug];
    let subcategoryId: string | null = null;
    if (p.subcategorySlug) {
      const sub = await supabase
        .from("categories")
        .select("id")
        .eq("slug", `${p.categorySlug}--${p.subcategorySlug}`)
        .maybeSingle();
      if (sub.data) subcategoryId = sub.data.id;
    }
    const { data: prod, error } = await supabase
      .from("products")
      .upsert(
        {
          slug: p.slug,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          brand: p.brand ?? null,
          title: p.title,
          short_description: p.shortDescription,
          description: p.description,
          images: [`/images/generated/${p.heroPromptKey.replace(":", "-")}.webp`],
          base_price_cents: p.basePriceCents,
          price_status: p.priceStatus,
          min_qty: p.minQty,
          lead_time_days: p.leadTimeDays,
          decoration_methods: p.decorationMethods,
          placement_zones: (p.placementZones ?? []) as never,
          options: (p.options ?? {}) as never,
          badges: p.badges ?? [],
          status: "active",
          seo_meta: {
            heroPromptKey: p.heroPromptKey,
          } as never,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (error) throw error;

    // reset tiers
    await supabase.from("price_tiers").delete().eq("product_id", prod.id);
    if (p.tierBreaks?.length) {
      const tiers = p.tierBreaks.map((tier, idx) => {
        const next = p.tierBreaks![idx + 1];
        return {
          product_id: prod.id,
          min_qty: tier.minQty,
          max_qty: next ? next.minQty - 1 : null,
          unit_price_cents: tier.unitCents,
        };
      });
      const { error: tErr } = await supabase.from("price_tiers").insert(tiers);
      if (tErr) throw tErr;
    }
  }
}

async function main() {
  console.log("Seeding categories…");
  const catIds = await seedCategories();
  console.log(`Seeded ${Object.keys(catIds).length} top-level categories.`);

  console.log("Seeding products…");
  await seedProducts(catIds);
  console.log(`Seeded ${sampleProducts.length} products.`);

  console.log("✓ Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
