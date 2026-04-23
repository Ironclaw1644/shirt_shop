"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { sampleProducts } from "@/lib/catalog/sample-products";
import { formatMoneyCents } from "@/lib/utils/money";

export function FeaturedCarousel() {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const featured = sampleProducts
    .filter((p) => p.badges?.length)
    .slice(0, 8);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-20 lg:py-24 bg-paper">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <Eyebrow tone="gold">Bestsellers</Eyebrow>
            <h2 className="heading-display mt-3 text-4xl sm:text-5xl text-ink">
              Shop what sells
            </h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="h-11 w-11 rounded-full border-2 border-ink/15 hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
            >
              <Icon icon="arrow-left" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="h-11 w-11 rounded-full border-2 border-ink/15 hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
            >
              <Icon icon="arrow-right" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4"
          style={{ scrollbarWidth: "none" }}
        >
          {featured.map((p) => (
            <Link
              key={p.slug}
              href={`/product/${p.slug}`}
              className="group min-w-[260px] sm:min-w-[300px] max-w-[300px] shrink-0 snap-start rounded-lg border border-ink/10 bg-card overflow-hidden shadow-press hover:shadow-press-lg transition-shadow"
            >
              <div className="relative aspect-square bg-paper-warm overflow-hidden">
                <Image
                  src={`/images/generated/${p.heroPromptKey.replace(":", "-")}.webp`}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="300px"
                />
                {p.badges?.length ? (
                  <Badge variant="crimson" className="absolute top-3 left-3">
                    {p.badges[0]}
                  </Badge>
                ) : null}
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-ink leading-tight line-clamp-2 min-h-[2.75rem]">
                  {p.title}
                </h3>
                <p className="mt-1 text-xs text-ink-mute line-clamp-1">{p.shortDescription}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display font-bold text-lg">
                    {p.priceStatus === "quote" || p.basePriceCents === null
                      ? "Quote"
                      : `from ${formatMoneyCents(p.basePriceCents)}`}
                  </span>
                  <span className="text-xs font-mono text-ink-mute">MIN {p.minQty}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/custom-printing">
              See the full catalog <Icon icon="arrow-right" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
