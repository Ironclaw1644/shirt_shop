/**
 * Seeds categories, subcategories, and products into Supabase.
 * Run with:
 *   npm run db:seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 *
 * If SUPABASE_SERVICE_ROLE_KEY is marked Sensitive in Vercel and can't be
 * pulled locally, use the deployed `/api/admin/seed-catalog` endpoint instead.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { seedSupabase } from "../lib/catalog/seed-supabase";

async function main() {
  console.log("Seeding…");
  const result = await seedSupabase();
  console.log(
    `✓ Seed complete: ${result.categories} top-level categories, ${result.products} products.`,
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
