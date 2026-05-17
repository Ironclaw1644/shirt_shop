/**
 * Inspect orphan products' image data — specifically, what's in seo_meta
 * (which may contain supplier CDN URLs that work, even when the local
 * /images/generated/ path doesn't exist).
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

  const rows: { slug: string; images: string[] | null; seo_meta: Record<string, unknown> | null }[] = [];
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await supa
      .from("products")
      .select("slug, images, seo_meta")
      .range(from, from + 999);
    if (error) { console.error(error); process.exit(1); }
    if (!data || data.length === 0) break;
    rows.push(...(data as never[]));
    if (data.length < 1000) break;
  }

  const orphans = rows.filter((r) => !staticSlugs.has(r.slug));

  let hasSeoImageUrl = 0;
  let hasSupplierUrl = 0;
  let hasImageSource = 0;
  const sourceDistrib = new Map<string, number>();

  for (const o of orphans) {
    const meta = o.seo_meta ?? {};
    if (meta.imageUrl) hasSeoImageUrl++;
    if (meta.supplierUrl) hasSupplierUrl++;
    if (meta.imageSource) {
      hasImageSource++;
      const s = String(meta.imageSource);
      sourceDistrib.set(s, (sourceDistrib.get(s) ?? 0) + 1);
    }
  }

  console.log(`Orphans: ${orphans.length}`);
  console.log(`  with seo_meta.imageUrl:    ${hasSeoImageUrl}/${orphans.length}`);
  console.log(`  with seo_meta.supplierUrl: ${hasSupplierUrl}/${orphans.length}`);
  console.log(`  with seo_meta.imageSource: ${hasImageSource}/${orphans.length}`);
  console.log(`\nimageSource distribution:`);
  for (const [k, v] of sourceDistrib.entries()) console.log(`  ${k}: ${v}`);

  // Sample one to show
  const s = orphans[0];
  if (s) {
    console.log(`\nSAMPLE seo_meta keys (first orphan ${s.slug}):`);
    const meta = s.seo_meta ?? {};
    for (const k of Object.keys(meta)) {
      const v = meta[k];
      if (typeof v === "string") {
        console.log(`  ${k}: ${v.slice(0, 100)}${v.length > 100 ? "…" : ""}`);
      } else {
        console.log(`  ${k}: ${JSON.stringify(v).slice(0, 100)}`);
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
