import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  categories,
  getCategory,
  getSubcategory,
} from "@/lib/catalog/categories";
import { productsInSubcategory } from "@/lib/catalog/sample-products";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { ProductCard } from "@/components/shop/product-card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

type Params = { category: string; subcategory: string };

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
}: {
  params: Promise<Params>;
}) {
  const { category, subcategory } = await params;
  const cat = getCategory(category);
  const sub = getSubcategory(category, subcategory);
  if (!cat || !sub) return notFound();

  const products = productsInSubcategory(cat.slug, sub.slug);
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
        {products.length === 0 ? (
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
