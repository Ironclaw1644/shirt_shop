import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { categories } from "../lib/catalog/categories";
import { sampleProducts } from "../lib/catalog/sample-products";

async function main() {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false }, db: { schema: "gaph" } },
  );

  // Static counts
  let staticTop = categories.length;
  let staticSub = 0;
  let staticSubsub = 0;
  for (const c of categories) {
    staticSub += c.subcategories.length;
    for (const s of c.subcategories) {
      staticSubsub += s.subcategories?.length ?? 0;
    }
  }
  const staticProducts = sampleProducts.length;

  // DB counts
  const { count: dbProductCount } = await supa
    .from("products")
    .select("id", { count: "exact", head: true });
  const { count: dbCategoryCount } = await supa
    .from("categories")
    .select("id", { count: "exact", head: true });
  const { count: dbTopCount } = await supa
    .from("categories")
    .select("id", { count: "exact", head: true })
    .is("parent_id", null);

  console.log("--- STATIC TS FILES ---");
  console.log("  top-level categories:", staticTop);
  console.log("  subcategories:       ", staticSub);
  console.log("  subsub-categories:   ", staticSubsub);
  console.log("  products:            ", staticProducts);
  console.log("--- SUPABASE DB ---");
  console.log("  top-level categories:", dbTopCount);
  console.log("  total categories:    ", dbCategoryCount, "(includes subs)");
  console.log("  products:            ", dbProductCount);
  console.log("--- GAP ---");
  console.log("  missing products:    ", staticProducts - (dbProductCount ?? 0));
  console.log("  missing subsubs:     ", staticSubsub, "(seed doesn't handle 3rd level)");
}

main().catch((e) => { console.error(e); process.exit(1); });
