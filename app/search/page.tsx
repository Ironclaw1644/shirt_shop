import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { sampleProducts } from "@/lib/catalog/sample-products";
import { ProductCard } from "@/components/shop/product-card";
import { Eyebrow } from "@/components/ui/eyebrow";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const results = q
    ? sampleProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categorySlug.includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false),
      )
    : [];
  return (
    <>
      <SiteHeader />
      <main id="main" className="container py-12 min-h-screen">
        <Eyebrow tone="crimson">Search</Eyebrow>
        <h1 className="heading-display mt-3 text-4xl">
          {q ? `Results for "${q}"` : "Search products"}
        </h1>
        <form method="get" className="mt-4 max-w-lg">
          <input
            name="q"
            defaultValue={q}
            placeholder="Business cards, banners, trophies, blank tees…"
            className="w-full rounded border border-ink/15 bg-white px-4 py-3 focus:border-primary focus:outline-none"
          />
        </form>
        <div className="mt-8">
          {results.length === 0 ? (
            <p className="text-ink-mute">No matches yet.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
