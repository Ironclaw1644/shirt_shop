"use client";

import * as React from "react";
import { ProductCard } from "@/components/shop/product-card";
import { Icon } from "@/components/ui/icon";
import type { SampleProduct } from "@/lib/catalog/sample-products";

/**
 * Product list for a subcategory page. Replaces the multi-faceted ProductFilters
 * sidebar with a single client-side search input above the grid.
 */
export function SubcategoryProducts({
  products,
  subcategoryName,
}: {
  products: SampleProduct[];
  subcategoryName: string;
}) {
  const [q, setQ] = React.useState("");
  const norm = q.trim().toLowerCase();
  const filtered = norm
    ? products.filter((p) => {
        const hay = `${p.title} ${p.shortDescription ?? ""} ${p.brand ?? ""}`.toLowerCase();
        return hay.includes(norm);
      })
    : products;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label htmlFor="sub-filter" className="sr-only">
          Filter {subcategoryName.toLowerCase()}
        </label>
        <div className="relative w-full sm:max-w-md">
          <Icon
            icon="magnifying-glass"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            id="sub-filter"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Filter ${subcategoryName.toLowerCase()}…`}
            className="h-11 w-full rounded-full border border-ink/15 bg-white pl-11 pr-4 text-sm text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <p className="text-sm text-ink-mute font-mono whitespace-nowrap">
          Showing {filtered.length} of {products.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-12 text-center">
          <Icon icon="magnifying-glass" className="text-3xl text-ink-mute" />
          <p className="mt-3 font-display font-semibold">
            No matches for &ldquo;{q}&rdquo;
          </p>
          <p className="text-sm text-ink-mute">
            Try a shorter keyword, or request a custom quote below.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
