import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Category } from "@/lib/catalog/categories";

export function CategoryHero({ category }: { category: Category }) {
  return (
    <section className="relative overflow-hidden bg-paper-warm">
      <div className="container pt-8 pb-16 lg:pt-10 lg:pb-20">
        <Breadcrumbs crumbs={[{ label: "Shop", href: "/" }, { label: category.name }]} />

        <div className="mt-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Eyebrow
              tone={
                category.accentColor === "charcoal"
                  ? "ink"
                  : category.accentColor === "gold"
                    ? "gold"
                    : "crimson"
              }
            >
              {category.eyebrow}
            </Eyebrow>
            <h1 className="heading-display mt-3 text-5xl sm:text-6xl lg:text-7xl text-ink leading-[0.95]">
              {category.name}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
              {category.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="#products">
                  Browse all <Icon icon="arrow-right" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/quote">
                  <Icon icon="bolt" /> Need 5,000+? Quote
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-mute">
              {category.subcategories.slice(0, 8).map((s) => (
                <Link
                  key={s.slug}
                  href={`/${category.slug}/${s.slug}`}
                  className="underline-offset-4 decoration-dotted hover:text-primary hover:underline"
                >
                  {s.name}
                </Link>
              ))}
              {category.subcategories.length > 8 && (
                <span className="text-ink-mute">+ {category.subcategories.length - 8} more</span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:h-[420px] rounded-lg overflow-hidden border border-ink/10 shadow-press-lg">
            <Image
              src={`/images/generated/category-${category.slug}.webp`}
              alt={`${category.name} — ${category.tagline}`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
