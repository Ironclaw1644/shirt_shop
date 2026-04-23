import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  productBySlug,
  sampleProducts,
  productsInCategory,
} from "@/lib/catalog/sample-products";
import { getCategory } from "@/lib/catalog/categories";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { PDPClient } from "@/components/shop/pdp-client";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import { siteConfig } from "@/lib/site-config";

type Params = { slug: string };

export async function generateStaticParams() {
  return sampleProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.shortDescription,
    alternates: { canonical: `${siteConfig.url}/product/${p.slug}` },
    openGraph: {
      title: `${p.title} — ${siteConfig.name}`,
      description: p.shortDescription,
      images: [`/images/generated/${p.heroPromptKey.replace(":", "-")}.webp`],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return notFound();
  const cat = getCategory(p.categorySlug);

  const upsells = productsInCategory(p.categorySlug).filter((x) => x.slug !== p.slug);

  return (
    <>
      <JsonLd
        data={productSchema({
          name: p.title,
          description: p.description,
          image: `${siteConfig.url}/images/generated/${p.heroPromptKey.replace(":", "-")}.webp`,
          sku: p.slug,
          brand: p.brand,
          priceCents: p.basePriceCents,
          url: `${siteConfig.url}/product/${p.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: "Home", url: siteConfig.url },
            cat ? { name: cat.name, url: `${siteConfig.url}/${cat.slug}` } : undefined,
            { name: p.title, url: `${siteConfig.url}/product/${p.slug}` },
          ].filter(Boolean) as { name: string; url: string }[],
        )}
      />

      <div className="container pt-8">
        <Breadcrumbs
          crumbs={[
            { label: "Shop", href: "/" },
            cat ? { label: cat.name, href: `/${cat.slug}` } : { label: "Shop" },
            { label: p.title },
          ]}
        />
      </div>

      <PDPClient product={p} upsells={upsells} />
    </>
  );
}
