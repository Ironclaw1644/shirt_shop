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
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in env.",
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

  // ── pre-fetch every subcategory id once so the products loop doesn't fire
  //    a per-product Supabase query (saves ~7600 round-trips at scale) ─────
  const subIdBySlug = new Map<string, string>();
  for (let from = 0; ; from += 1000) {
    const { data: subs, error: subsErr } = await supabase
      .from("categories")
      .select("id, slug")
      .not("parent_id", "is", null)
      .range(from, from + 999);
    if (subsErr) throw subsErr;
    if (!subs || subs.length === 0) break;
    for (const r of subs as { id: string; slug: string }[]) {
      subIdBySlug.set(r.slug, r.id);
    }
    if (subs.length < 1000) break;
  }

  // ── products + price_tiers ──────────────────────────────────────────────
  let productCount = 0;
  for (const p of sampleProducts) {
    const categoryId = topLevel[p.categorySlug];
    if (!categoryId) {
      throw new Error(`Unknown categorySlug "${p.categorySlug}" on "${p.slug}"`);
    }
    const subcategoryId = p.subcategorySlug
      ? subIdBySlug.get(`${p.categorySlug}--${p.subcategorySlug}`) ?? null
      : null;
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
            ...(p.imageSource ? { imageSource: p.imageSource } : {}),
            ...(p.imageUrl ? { imageUrl: p.imageUrl } : {}),
            ...(p.originalImageUrl ? { originalImageUrl: p.originalImageUrl } : {}),
            ...(p.supplierUrl ? { supplierUrl: p.supplierUrl } : {}),
          } as never,
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
  //
  // For 7000+ live slugs we can't put the whole list in a NOT IN URL filter
  // (Cloudflare rejects with 414 Request-URI Too Large). Instead, pull every
  // DB slug in pages, compute the set difference client-side, then DELETE by
  // id in batches.
  const liveSlugSet = new Set(sampleProducts.map((p) => p.slug));
  const allDbRows: { id: string; slug: string }[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await supabase
      .from("products")
      .select("id, slug")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!page || page.length === 0) break;
    allDbRows.push(...(page as { id: string; slug: string }[]));
    if (page.length < PAGE) break;
  }
  const orphans = allDbRows.filter((r) => !liveSlugSet.has(r.slug));
  const orphanIds = orphans.map((r) => r.id);

  let deletedCount = 0;
  if (orphanIds.length > 0) {
    // Batch the DELETE to keep URL filter sizes small (Cloudflare caps at
    // ~16KB; UUIDs are 36 chars so 200 ids per batch is well under).
    const BATCH = 200;
    for (let i = 0; i < orphanIds.length; i += BATCH) {
      const chunk = orphanIds.slice(i, i + BATCH);
      // Clear price_tiers for this chunk first so the FK doesn't block.
      const { error: tErr } = await supabase
        .from("price_tiers")
        .delete()
        .in("product_id", chunk);
      if (tErr) throw tErr;

      const { error: delErr } = await supabase
        .from("products")
        .delete()
        .in("id", chunk);
      if (delErr) {
        if (delErr.code === "23503") {
          throw new Error(
            `Hard-delete blocked by FK constraint — likely order_items references one of the ${chunk.length} orphan products in this batch. Resolve order data before retrying. (${delErr.message})`,
          );
        }
        throw delErr;
      }
      deletedCount += chunk.length;
    }
  }

  // ── hard-delete orphan subcategories ──────────────────────────────────
  // Any subcategory row whose slug isn't in the current static catalog gets
  // purged. Top-level cats are never deleted (parent_id IS NULL filter).
  const liveSubSlugs: string[] = [];
  for (const c of categories) {
    for (const s of c.subcategories) liveSubSlugs.push(`${c.slug}--${s.slug}`);
  }
  const liveSubList = `(${liveSubSlugs.map((s) => `"${s}"`).join(",")})`;
  const { data: subOrphans, error: subOrphErr } = await supabase
    .from("categories")
    .select("id, slug")
    .not("parent_id", "is", null)
    .not("slug", "in", liveSubList);
  if (subOrphErr) throw subOrphErr;
  let deletedSubcategories = 0;
  if (subOrphans && subOrphans.length > 0) {
    const { error: subDelErr } = await supabase
      .from("categories")
      .delete()
      .in(
        "id",
        subOrphans.map((r) => r.id),
      );
    if (subDelErr) throw subDelErr;
    deletedSubcategories = subOrphans.length;
  }

  return {
    categories: Object.keys(topLevel).length,
    products: productCount,
    deleted: deletedCount,
    deletedSubcategories,
  };
}
