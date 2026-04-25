import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCategory } from "@/lib/catalog/categories";
import { dbToSampleProduct, PRODUCT_SELECT, type DbProductRow } from "@/lib/catalog/from-db";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { PDPClient } from "@/components/shop/pdp-client";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import { siteConfig } from "@/lib/site-config";

type Params = { slug: string };

export async function generateStaticParams() {
  // Cookie-free client — generateStaticParams runs at build with no request.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supa = createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: "gaph" },
  });
  const { data } = await supa.from("products").select("slug").eq("status", "active");
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

async function fetchProduct(slug: string) {
  const supa = await getSupabaseServerClient();
  const { data } = await supa
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return data ? dbToSampleProduct(data as unknown as DbProductRow) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await fetchProduct(slug);
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
  const p = await fetchProduct(slug);
  if (!p) return notFound();
  const cat = getCategory(p.categorySlug);

  const supa = await getSupabaseServerClient();
  const { data: catRow } = cat
    ? await supa.from("categories").select("id").eq("slug", cat.slug).maybeSingle()
    : { data: null };
  let upsells: ReturnType<typeof dbToSampleProduct>[] = [];
  if (catRow?.id) {
    const { data: rows } = await supa
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("category_id", catRow.id)
      .eq("status", "active")
      .neq("slug", slug)
      .limit(8);
    upsells = (rows ?? []).map((r) => dbToSampleProduct(r as unknown as DbProductRow));
  }

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
