import { categories } from "./categories";
import { sampleProducts } from "./sample-products";

export type NavProduct = { slug: string; title: string };
export type NavSubcategory = {
  slug: string;
  name: string;
  blurb?: string;
  products: NavProduct[];
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
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        blurb: s.blurb,
        products: sampleProducts
          .filter(
            (p) => p.categorySlug === c.slug && p.subcategorySlug === s.slug,
          )
          .map((p) => ({ slug: p.slug, title: p.title }))
          .sort((a, b) => a.title.localeCompare(b.title)),
      }))
      .filter((s) => s.products.length > 0),
  }));
}
