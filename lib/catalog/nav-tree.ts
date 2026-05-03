import { categories } from "./categories";
import { sampleProducts } from "./sample-products";

export type NavProduct = { slug: string; title: string };
export type NavSubsubcategory = {
  slug: string;
  name: string;
  count: number;
  products: NavProduct[];
};
export type NavSubcategory = {
  slug: string;
  name: string;
  blurb?: string;
  products: NavProduct[];
  /** Optional third-level groupings — when present, the dropdown should show
   *  these as the expand target instead of the products list. */
  subcategories?: NavSubsubcategory[];
};
export type NavCategory = {
  slug: string;
  name: string;
  navLabel: string;
  tagline: string;
  subcategories: NavSubcategory[];
};

/**
 * Server-only. Builds a slim catalog tree (categories → subcategories → products
 * by slug+title only) for the navigation dropdown. Calling this from a server
 * component and passing the result to a client component keeps the full
 * sampleProducts data (~2500 lines) out of the client bundle.
 */
export function buildNavTree(): NavCategory[] {
  return categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    navLabel: c.navLabel ?? c.name,
    tagline: c.tagline,
    subcategories: c.subcategories
      .map((s) => {
        const products = sampleProducts.filter(
          (p) => p.categorySlug === c.slug && p.subcategorySlug === s.slug,
        );
        const subsubs = s.subcategories
          ? s.subcategories
              .map((ss) => {
                const ssProducts = products.filter(
                  (p) => p.subsubcategorySlug === ss.slug,
                );
                return {
                  slug: ss.slug,
                  name: ss.name,
                  count: ssProducts.length,
                  products: ssProducts
                    .map((p) => ({ slug: p.slug, title: p.title }))
                    .sort((a, b) => a.title.localeCompare(b.title)),
                };
              })
              .filter((ss) => ss.count > 0)
          : undefined;
        return {
          slug: s.slug,
          name: s.name,
          blurb: s.blurb,
          products: products
            .map((p) => ({ slug: p.slug, title: p.title }))
            .sort((a, b) => a.title.localeCompare(b.title)),
          subcategories: subsubs && subsubs.length > 0 ? subsubs : undefined,
        };
      })
      .filter((s) => s.products.length > 0),
  }));
}
