// NOTE: not using `import "server-only"` here because this module is also imported
// by scripts/seed.ts (tsx CLI), where `server-only` throws unconditionally. The
// service-role key requirement below provides effective server-only enforcement.
import { createClient } from "@supabase/supabase-js";
import { categories } from "./categories";
import { sampleProducts } from "./sample-products";
import type { Database } from "@/types/supabase";

/**
 * Idempotent seed: upserts every static category, subcategory, and product
 * into Supabase. Safe to re-run; uses `onConflict: "slug"` everywhere.
 *
 * Used both by scripts/seed.ts (CLI) and by /api/admin/seed-catalog (one-shot
 * deployed endpoint when the service-role key is sensitive and not pullable).
 */
export async function seedSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.",
    );
  }
  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false },
    db: { schema: "gaph" },
  });

  // ── categories + subcategories ──────────────────────────────────────────
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

  // ── products + price_tiers ──────────────────────────────────────────────
  let productCount = 0;
  for (const p of sampleProducts) {
    const categoryId = topLevel[p.categorySlug];
    if (!categoryId) {
      throw new Error(`Unknown categorySlug "${p.categorySlug}" on "${p.slug}"`);
    }
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
          seo_meta: { heroPromptKey: p.heroPromptKey } as never,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (error) throw error;

    // reset and rebuild tiers for this product
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
    productCount += 1;
  }

  // ── hard-delete orphans (printtales-mirror cleanup) ────────────────────
  // Any product row in Supabase whose slug isn't in the current static catalog
  // gets purged. Runs every seed so the DB stays in lockstep with the code.
  // FK safety: postgres aborts the DELETE atomically if order_items references
  // any orphan; we surface that as a clear error so the operator can resolve.
  const liveSlugs = sampleProducts.map((p) => p.slug);
  const inList = `(${liveSlugs.map((s) => `"${s}"`).join(",")})`;
  const { data: orphans, error: orphErr } = await supabase
    .from("products")
    .select("id, slug")
    .not("slug", "in", inList);
  if (orphErr) throw orphErr;
  const orphanIds = (orphans ?? []).map((r) => r.id);

  let deletedCount = 0;
  if (orphanIds.length > 0) {
    // Clear price_tiers for orphans first so the products DELETE doesn't trip
    // on the FK from price_tiers.product_id.
    const { error: tErr } = await supabase
      .from("price_tiers")
      .delete()
      .in("product_id", orphanIds);
    if (tErr) throw tErr;

    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .in("id", orphanIds);
    if (delErr) {
      if (delErr.code === "23503") {
        throw new Error(
          `Hard-delete blocked by FK constraint — likely order_items references one of ${orphanIds.length} orphan products. Resolve order data before retrying. (${delErr.message})`,
        );
      }
      throw delErr;
    }
    deletedCount = orphanIds.length;
  }

  return {
    categories: Object.keys(topLevel).length,
    products: productCount,
    deleted: deletedCount,
  };
}
