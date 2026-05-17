/**
 * Find products in the DB whose slug is NOT in the static catalog (i.e. won't
 * show on the public site). For each orphan, also look for near-duplicates in
 * the static catalog by title — if one exists, the orphan is likely a stale
 * duplicate from an earlier seed.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { sampleProducts } from "../lib/catalog/sample-products";

function normalize(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function main() {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false }, db: { schema: "gaph" } },
  );

  // Pull all DB products (paginated past 1000-row default).
  const dbRows: { id: string; slug: string; title: string; status: string; created_at: string }[] = [];
  const PAGE = 1000;
  for (let from = 0; from < 50000; from += PAGE) {
    const { data, error } = await supa
      .from("products")
      .select("id, slug, title, status, created_at")
      .range(from, from + PAGE - 1);
    if (error) { console.error(error); process.exit(1); }
    if (!data || data.length === 0) break;
    dbRows.push(...data);
    if (data.length < PAGE) break;
  }
  console.log(`DB total products: ${dbRows.length}`);

  const staticSlugs = new Set(sampleProducts.map((p) => p.slug));
  const orphans = dbRows.filter((r) => !staticSlugs.has(r.slug));
  console.log(`Orphan products (DB slug not in static catalog): ${orphans.length}\n`);

  // Build static title index for near-duplicate detection.
  const staticByNormTitle = new Map<string, { slug: string; title: string }[]>();
  for (const p of sampleProducts) {
    const k = normalize(p.title);
    const arr = staticByNormTitle.get(k) ?? [];
    arr.push({ slug: p.slug, title: p.title });
    staticByNormTitle.set(k, arr);
  }

  for (const o of orphans) {
    const matches = staticByNormTitle.get(normalize(o.title)) ?? [];
    const created = o.created_at?.slice(0, 10) ?? "?";
    console.log(`  slug:    ${o.slug}`);
    console.log(`  title:   ${o.title}`);
    console.log(`  status:  ${o.status}    created: ${created}`);
    if (matches.length > 0) {
      console.log(`  DUPLICATE OF (same title in static catalog):`);
      for (const m of matches) console.log(`    - slug=${m.slug}`);
    } else {
      console.log(`  No same-title match in static catalog (unique row).`);
    }
    console.log("");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
