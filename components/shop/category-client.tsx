"use client";

import * as React from "react";
import { ProductCard } from "@/components/shop/product-card";
import { ProductFilters } from "@/components/shop/product-filters";
import { Icon } from "@/components/ui/icon";
import type { Category } from "@/lib/catalog/categories";
import type { SampleProduct } from "@/lib/catalog/sample-products";

export function CategoryClient({
  category,
  products,
}: {
  category: Category;
  products: SampleProduct[];
}) {
  const [filtered, setFiltered] = React.useState(products);

  return (
    <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
      <ProductFilters category={category} products={products} onChange={setFiltered} />

      <div id="products">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink-mute font-mono">
            Showing {filtered.length} of {products.length}
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-12 text-center">
            <Icon icon="magnifying-glass" className="text-3xl text-ink-mute" />
            <p className="mt-3 font-display font-semibold">No matching products</p>
            <p className="text-sm text-ink-mute">Try clearing a filter or searching differently.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
