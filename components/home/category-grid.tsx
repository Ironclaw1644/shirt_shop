import { categories } from "@/lib/catalog/categories";
import { sampleProducts } from "@/lib/catalog/sample-products";
import { CategoryGridClient } from "./category-grid-client";

/**
 * Server wrapper that pre-computes the populated-collection count per top-level
 * category and passes it to the client component as a prop. This keeps the
 * full sampleProducts catalog (including 7,600+ imported supplier blanks) out
 * of the client bundle.
 */
export function CategoryGrid() {
  const populatedCounts: Record<string, number> = {};
  for (const c of categories) {
    const subs = new Set<string>();
    for (const p of sampleProducts) {
      if (p.categorySlug === c.slug && p.subcategorySlug) {
        subs.add(p.subcategorySlug);
      }
    }
    populatedCounts[c.slug] = subs.size;
  }
  return <CategoryGridClient populatedCounts={populatedCounts} />;
}
