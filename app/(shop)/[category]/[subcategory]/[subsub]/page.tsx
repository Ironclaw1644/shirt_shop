import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  categories,
  getCategory,
  getSubcategory,
  getSubsubcategory,
} from "@/lib/catalog/categories";
import { productsInSubsubcategory } from "@/lib/catalog/sample-products";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { SubcategoryProducts } from "@/components/shop/subcategory-products";
import { QuoteCallout } from "@/components/shop/quote-callout";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

type Params = { category: string; subcategory: string; subsub: string };
type SearchParams = { page?: string };

const PAGE_SIZE = 24;

export async function generateStaticParams() {
  return categories.flatMap((c) =>
    c.subcategories.flatMap((s) =>
      (s.subcategories ?? []).map((ss) => ({
        category: c.slug,
        subcategory: s.slug,
        subsub: ss.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, subcategory, subsub } = await params;
  const cat = getCategory(category);
  const sub = getSubcategory(category, subcategory);
  const ss = getSubsubcategory(category, subcategory, subsub);
  if (!cat || !sub || !ss) return {};
  return {
    title: `${ss.name} ${sub.name} · ${cat.name}`,
    description:
      ss.blurb ??
      `${ss.name} ${sub.name.toLowerCase()} — locally engraved in Georgia.`,
    alternates: {
      canonical: `${siteConfig.url}/${cat.slug}/${sub.slug}/${ss.slug}`,
    },
  };
}

export default async function SubsubPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { category, subcategory, subsub } = await params;
  const { page: pageParam } = await searchParams;
  const cat = getCategory(category);
  const sub = getSubcategory(category, subcategory);
  const ss = getSubsubcategory(category, subcategory, subsub);
  if (!cat || !sub || !ss) return notFound();

  const allProducts = productsInSubsubcategory(cat.slug, sub.slug, ss.slug);
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
          { name: sub.name, url: `${siteConfig.url}/${cat.slug}/${sub.slug}` },
          {
            name: ss.name,
            url: `${siteConfig.url}/${cat.slug}/${sub.slug}/${ss.slug}`,
          },
        ])}
      />
      <section className="container pt-8 pb-10">
        <Breadcrumbs
          crumbs={[
            { label: "Shop", href: "/" },
            { label: cat.name, href: `/${cat.slug}` },
            { label: sub.name, href: `/${cat.slug}/${sub.slug}` },
            { label: ss.name },
          ]}
        />
        <div className="mt-6">
          <Eyebrow tone="crimson">
            {cat.name} · {sub.name}
          </Eyebrow>
          <h1 className="heading-display mt-3 text-4xl sm:text-5xl lg:text-6xl text-ink">
            {ss.name} {sub.name}
          </h1>
          {ss.blurb && (
            <p className="mt-4 max-w-2xl text-lg text-ink-soft">{ss.blurb}</p>
          )}
        </div>
      </section>

      <section className="container pb-20">
        {allProducts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-12 text-center">
            <p className="font-display text-lg font-semibold">
              Catalog updating — check back or request a quote.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href={`/${cat.slug}/${sub.slug}`}
                className="inline-flex items-center gap-1 rounded border border-ink/15 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                Back to {sub.name}
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
            subcategoryName={`${ss.name} ${sub.name}`}
            totalCount={allProducts.length}
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/${cat.slug}/${sub.slug}/${ss.slug}`}
          />
        )}
      </section>

      <QuoteCallout />
    </>
  );
}
