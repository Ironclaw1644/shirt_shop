"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { categories } from "@/lib/catalog/categories";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/eyebrow";

const accentMap: Record<"crimson" | "gold" | "charcoal", string> = {
  crimson: "text-primary",
  gold: "text-accent-700",
  charcoal: "text-ink",
};

export function CategoryGrid() {
  return (
    <section id="categories" className="relative py-20 lg:py-28 bg-paper-warm">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <Eyebrow tone="gold">One shop · every method</Eyebrow>
            <h2 className="heading-display mt-3 text-4xl sm:text-5xl lg:text-6xl text-ink">
              Pick the press,
              <br />
              <span className="italic font-editorial font-normal text-primary">we&rsquo;ll handle the rest.</span>
            </h2>
          </div>
          <p className="md:max-w-sm text-ink-soft leading-relaxed">
            Eight categories. Thousands of SKUs. Every item ships either blank-bulk or fully
            decorated, with tiered volume pricing that scales as your order grows.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, idx) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true, margin: "-50px" }}
              className={idx === 0 ? "lg:col-span-2 lg:row-span-2" : ""}
            >
              <Link
                href={`/${c.slug}`}
                className="tile-3d group relative block h-full overflow-hidden rounded-lg border border-ink/10 bg-card shadow-press"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={`/images/generated/category-${c.slug}.webp`}
                    alt={`${c.name} — ${c.tagline}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                  <div className="proof-stamp absolute top-4 right-4 rounded-sm bg-accent px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink shadow-stamp">
                    {c.eyebrow}
                  </div>
                </div>
                <div className="relative p-6 bg-card">
                  <h3
                    className={`font-display text-2xl font-bold tracking-tight ${accentMap[c.accentColor]}`}
                  >
                    {c.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-soft leading-relaxed line-clamp-2">
                    {c.tagline}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-ink-mute font-mono">
                      {c.subcategories.length} collections
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink group-hover:text-primary transition-colors">
                      Browse <Icon icon="arrow-right" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
