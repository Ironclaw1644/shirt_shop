import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  categories,
  getCategory,
  getSubcategory,
} from "@/lib/catalog/categories";
import {
  productsInSubcategory,
  productsInSubsubcategory,
} from "@/lib/catalog/sample-products";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { SubcategoryProducts } from "@/components/shop/subcategory-products";
import { QuoteCallout } from "@/components/shop/quote-callout";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

type Params = { category: string; subcategory: string };
type SearchParams = { page?: string };

const PAGE_SIZE = 24;

export async function generateStaticParams() {
  return categories.flatMap((c) =>
    c.subcategories.map((s) => ({ category: c.slug, subcategory: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, subcategory } = await params;
  const cat = getCategory(category);
  const sub = getSubcategory(category, subcategory);
  if (!cat || !sub) return {};
  return {
    title: `${sub.name} · ${cat.name}`,
    description:
      sub.blurb ?? `Shop ${sub.name.toLowerCase()} in ${cat.name.toLowerCase()} — locally printed in Georgia.`,
    alternates: { canonical: `${siteConfig.url}/${cat.slug}/${sub.slug}` },
  };
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { category, subcategory } = await params;
  const { page: pageParam } = await searchParams;
  const cat = getCategory(category);
  const sub = getSubcategory(category, subcategory);
  if (!cat || !sub) return notFound();

  // If this subcategory has third-level groupings (e.g. resin trophies split
  // by sport), render a grid of those tiles instead of a flat product list.
  // Filter to populated subsubs only.
  const populatedSubsubs = (sub.subcategories ?? [])
    .map((ss) => ({
      ss,
      count: productsInSubsubcategory(cat.slug, sub.slug, ss.slug).length,
    }))
    .filter((x) => x.count > 0);

  const allProducts = productsInSubcategory(cat.slug, sub.slug);
  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const products = allProducts.slice(offset, offset + PAGE_SIZE);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: siteConfig.url },
          { name: cat.name, url: `${siteConfig.url}/${cat.slug}` },
          {
            name: sub.name,
            url: `${siteConfig.url}/${cat.slug}/${sub.slug}`,
          },
        ])}
      />
      <section className="container pt-8 pb-10">
        <Breadcrumbs
          crumbs={[
            { label: "Shop", href: "/" },
            { label: cat.name, href: `/${cat.slug}` },
            { label: sub.name },
          ]}
        />
        <div className="mt-6">
          <Eyebrow tone="crimson">{cat.name}</Eyebrow>
          <h1 className="heading-display mt-3 text-4xl sm:text-5xl lg:text-6xl text-ink">
            {sub.name}
          </h1>
          {sub.blurb && (
            <p className="mt-4 max-w-2xl text-lg text-ink-soft">{sub.blurb}</p>
          )}
        </div>
      </section>

      <section className="container pb-20">
        {populatedSubsubs.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {populatedSubsubs.map(({ ss, count }) => (
              <Link
                key={ss.slug}
                href={`/${cat.slug}/${sub.slug}/${ss.slug}`}
                className="group flex h-full flex-col rounded-lg border border-ink/10 bg-card p-6 shadow-press transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-press-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-ink group-hover:text-primary leading-tight">
                    {ss.name}
                  </h3>
                  <Icon
                    icon="arrow-right"
                    className="mt-1 text-ink-mute group-hover:text-primary"
                  />
                </div>
                {ss.blurb && (
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-3">
                    {ss.blurb}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between text-xs font-mono text-ink-mute">
                  <span>
                    {count} {count === 1 ? "product" : "products"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-ink-soft group-hover:text-primary">
                    Browse
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-12 text-center">
            <p className="font-display text-lg font-semibold">
              Catalog updating — check back or request a quote.
            </p>
            <p className="mt-2 text-sm text-ink-mute">
              We print hundreds of SKUs in this collection on demand.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href={`/${cat.slug}`}
                className="inline-flex items-center gap-1 rounded border border-ink/15 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                Back to {cat.name}
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center gap-1 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Request quote
              </Link>
            </div>
          </div>
        ) : (
          <SubcategoryProducts
            products={products}
            subcategoryName={sub.name}
            totalCount={allProducts.length}
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/${cat.slug}/${sub.slug}`}
          />
        )}
      </section>

      <QuoteCallout />
    </>
  );
}
