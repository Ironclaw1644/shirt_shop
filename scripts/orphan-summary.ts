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

  // Pull all DB products + their categories (paginated).
  const dbRows: { id: string; slug: string; title: string; status: string; created_at: string; category_id: string | null }[] = [];
  const PAGE = 1000;
  for (let from = 0; from < 50000; from += PAGE) {
    const { data, error } = await supa
      .from("products")
      .select("id, slug, title, status, created_at, category_id")
      .range(from, from + PAGE - 1);
    if (error) { console.error(error); process.exit(1); }
    if (!data || data.length === 0) break;
    dbRows.push(...data);
    if (data.length < PAGE) break;
  }

  // Category lookup
  const { data: cats } = await supa
    .from("categories")
    .select("id, slug, name, parent_id");
  const catById = new Map((cats ?? []).map((c) => [c.id, c]));

  const staticSlugs = new Set(sampleProducts.map((p) => p.slug));
  const orphans = dbRows.filter((r) => !staticSlugs.has(r.slug));

  // Bucket by created date + category + slug-prefix
  const byDate = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const bySlugPrefix = new Map<string, number>();
  const byStatus = new Map<string, number>();

  for (const o of orphans) {
    const d = o.created_at?.slice(0, 10) ?? "?";
    byDate.set(d, (byDate.get(d) ?? 0) + 1);

    const cat = o.category_id ? catById.get(o.category_id) : null;
    const catLabel = cat?.name ?? "(none)";
    byCategory.set(catLabel, (byCategory.get(catLabel) ?? 0) + 1);

    const prefix = o.slug.split("-").slice(0, 2).join("-");
    bySlugPrefix.set(prefix, (bySlugPrefix.get(prefix) ?? 0) + 1);

    byStatus.set(o.status, (byStatus.get(o.status) ?? 0) + 1);
  }

  // Count price_tiers attached to orphans
  const orphanIds = orphans.map((o) => o.id);
  let tierCount = 0;
  for (let i = 0; i < orphanIds.length; i += 100) {
    const chunk = orphanIds.slice(i, i + 100);
    const { count } = await supa
      .from("price_tiers")
      .select("id", { count: "exact", head: true })
      .in("product_id", chunk);
    tierCount += count ?? 0;
  }

  // Also check if any order_items reference these orphans (FK risk)
  let orderItemCount = 0;
  for (let i = 0; i < orphanIds.length; i += 100) {
    const chunk = orphanIds.slice(i, i + 100);
    const { count } = await supa
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .in("product_id", chunk);
    orderItemCount += count ?? 0;
  }

  console.log(`Total orphans: ${orphans.length}`);
  console.log(`Attached price_tiers rows: ${tierCount}`);
  console.log(`Attached order_items rows: ${orderItemCount}  ${orderItemCount > 0 ? "← deletion will need to handle this!" : ""}`);
  console.log("");
  console.log("By created date:");
  for (const [k, v] of [...byDate.entries()].sort((a,b) => b[1]-a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log("");
  console.log("By status:");
  for (const [k, v] of [...byStatus.entries()].sort((a,b) => b[1]-a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log("");
  console.log("By category:");
  for (const [k, v] of [...byCategory.entries()].sort((a,b) => b[1]-a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log("");
  console.log("By slug-prefix (top 10):");
  const sortedPrefix = [...bySlugPrefix.entries()].sort((a,b) => b[1]-a[1]).slice(0, 10);
  for (const [k, v] of sortedPrefix) console.log(`  ${k}-*: ${v}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
