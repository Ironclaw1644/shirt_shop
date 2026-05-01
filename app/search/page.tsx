import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { sampleProducts } from "@/lib/catalog/sample-products";
import { ProductCard } from "@/components/shop/product-card";
import { QuoteCallout } from "@/components/shop/quote-callout";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";

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
      <main id="main" className="min-h-screen">
        <section className="container py-10">
          <Eyebrow tone="crimson">Search</Eyebrow>
          <h1 className="heading-display mt-3 text-4xl sm:text-5xl text-ink">
            {q ? `Results for “${q}”` : "What can we help you find?"}
          </h1>

          <form
            method="get"
            role="search"
            className="mt-6 max-w-2xl"
          >
            <label htmlFor="search-input" className="sr-only">
              Search products
            </label>
            <div className="relative">
              <Icon
                icon="magnifying-glass"
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-primary"
              />
              <input
                id="search-input"
                type="search"
                name="q"
                defaultValue={q}
                autoFocus={!q}
                placeholder="Hi! What can we help you find today?"
                className="h-14 w-full rounded-full border-2 border-ink/10 bg-white pl-14 pr-32 text-base text-ink placeholder:text-ink-mute placeholder:italic shadow-press transition-shadow focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-press-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 font-display font-semibold text-white text-sm shadow-press hover:bg-primary-700 transition-all"
              >
                Search
                <Icon icon="arrow-right" />
              </button>
            </div>
          </form>

          {q && (
            <p className="mt-4 text-sm text-ink-mute font-mono">
              {results.length === 0
                ? "0 matches"
                : `${results.length} ${results.length === 1 ? "match" : "matches"}`}
            </p>
          )}
        </section>

        <section className="container pb-16">
          {q && results.length === 0 && (
            <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-10 text-center">
              <Icon icon="magnifying-glass" className="text-3xl text-ink-mute" />
              <p className="mt-3 font-display font-semibold text-ink">
                No products match &ldquo;{q}&rdquo; yet.
              </p>
              <p className="mt-1 text-sm text-ink-mute">
                We print thousands of SKUs on demand — request a quote and we&rsquo;ll match it.
              </p>
            </div>
          )}
          {results.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </section>

        <QuoteCallout />
      </main>
      <SiteFooter />
    </>
  );
}
