import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { categories, getCategory } from "@/lib/catalog/categories";
import { productsInCategory } from "@/lib/catalog/sample-products";
import { cityLandings, getCityLanding } from "@/lib/seo/cities";
import { CategoryHero } from "@/components/shop/category-hero";
import { CategoryClient } from "@/components/shop/category-client";
import { PerforatedDivider } from "@/components/ui/perforated-divider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, localBusinessSchema } from "@/lib/seo/schema";

type Params = { category: string };

const CITY_SLUGS = new Set(cityLandings.map((c) => c.slug));

export async function generateStaticParams() {
  const catParams = categories.map((c) => ({ category: c.slug }));
  const cityParams = cityLandings.map((c) => ({ category: c.slug }));
  return [...catParams, ...cityParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  if (CITY_SLUGS.has(category)) {
    const city = getCityLanding(category);
    if (!city) return {};
    return {
      title: city.h1,
      description: city.intro.replace(/&rsquo;/g, "'").replace(/<[^>]+>/g, ""),
      alternates: { canonical: `${siteConfig.url}/${city.slug}` },
      openGraph: {
        title: city.h1,
        description: city.intro,
        images: [city.image],
      },
    };
  }
  const cat = getCategory(category);
  if (!cat) return {};
  return {
    title: `${cat.name} · Locally printed in Georgia`,
    description: cat.intro,
    alternates: { canonical: `${siteConfig.url}/${cat.slug}` },
    openGraph: {
      title: `${cat.name} — ${siteConfig.name}`,
      description: cat.intro,
      images: [`/images/generated/category-${cat.slug}.webp`],
    },
  };
}

export default async function CategoryOrCityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;

  if (CITY_SLUGS.has(category)) {
    return <CityLandingContent slug={category} />;
  }

  const cat = getCategory(category);
  if (!cat) return notFound();
  const products = productsInCategory(cat.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: siteConfig.url },
          { name: cat.name, url: `${siteConfig.url}/${cat.slug}` },
        ])}
      />
      <CategoryHero category={cat} />

      <section className="container py-14">
        <CategoryClient category={cat} products={products} />
      </section>

      <PerforatedDivider className="text-primary/40" />

      <section className="container py-16 bg-paper">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="heading-display text-3xl sm:text-4xl text-ink">
              Don&rsquo;t see the size run you need?
            </h2>
            <p className="mt-4 text-ink-soft leading-relaxed">
              High-volume runs are our everyday work. Tell us
              what you need and we&rsquo;ll quote tier pricing, lead time, and shipping —
              usually within one business day.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg">
                <Link href="/quote">
                  <Icon icon="bolt" /> Request a quote
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Talk to an expert</Link>
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {cat.subcategories.slice(0, 8).map((s) => (
              <Link
                key={s.slug}
                href={`/${cat.slug}/${s.slug}`}
                className="group flex items-center justify-between rounded border border-ink/10 bg-card px-4 py-3 hover:border-primary hover:-translate-y-0.5 transition-all shadow-press"
              >
                <span className="font-display font-semibold text-ink group-hover:text-primary">
                  {s.name}
                </span>
                <Icon icon="arrow-right" className="text-ink-mute group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CityLandingContent({ slug }: { slug: string }) {
  const c = getCityLanding(slug)!;
  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: siteConfig.url },
          { name: c.city, url: `${siteConfig.url}/${c.slug}` },
        ])}
      />

      <section className="relative overflow-hidden bg-paper-warm">
        <div className="absolute inset-0 paper-grain opacity-80" aria-hidden />
        <div className="container relative pt-14 pb-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Eyebrow tone="crimson">{c.eyebrow}</Eyebrow>
            <h1 className="heading-display mt-3 text-5xl sm:text-6xl lg:text-7xl text-ink leading-[0.95]">
              {c.h1}
            </h1>
            <p
              className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed"
              dangerouslySetInnerHTML={{ __html: c.intro }}
            />
            <p className="mt-4 font-editorial italic text-primary text-lg">{c.angle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/quote">
                  <Icon icon="bolt" /> Get a {c.city} quote
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Visit the shop</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto lg:h-[420px] rounded-lg overflow-hidden border border-ink/10 shadow-press-lg">
            <Image
              src={c.image}
              alt={`${c.city} printing, promo, and apparel`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="heading-display text-3xl sm:text-4xl">
          For the <span className="text-primary">{c.city}</span> community
        </h2>
        <p className="mt-3 max-w-3xl text-ink-soft leading-relaxed">{c.audienceCopy}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group rounded-lg border border-ink/10 bg-card p-5 hover:border-primary hover:-translate-y-0.5 transition-all shadow-press"
            >
              <p className="font-display text-lg font-bold text-ink group-hover:text-primary">
                {cat.name}
              </p>
              <p className="mt-1 text-sm text-ink-mute">{cat.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition">
                Explore <Icon icon="arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
