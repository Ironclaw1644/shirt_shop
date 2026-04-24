"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/catalog/categories";
import type { SampleProduct } from "@/lib/catalog/sample-products";
import { apparelBrands } from "@/lib/catalog/brands";

type Filters = {
  search: string;
  brands: Set<string>;
  methods: Set<string>;
  minQty?: number;
};

export function ProductFilters({
  category,
  products,
  onChange,
}: {
  category: Category;
  products: SampleProduct[];
  onChange: (filtered: SampleProduct[]) => void;
}) {
  const [filters, setFilters] = React.useState<Filters>({
    search: "",
    brands: new Set(),
    methods: new Set(),
  });

  React.useEffect(() => {
    const filtered = products.filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filters.brands.size > 0 && !filters.brands.has(p.brand ?? "")) return false;
      if (filters.methods.size > 0 && !p.decorationMethods.some((m) => filters.methods.has(m))) {
        return false;
      }
      if (filters.minQty && p.minQty > filters.minQty) return false;
      return true;
    });
    onChange(filtered);
  }, [filters, products, onChange]);

  // Count products matching a single filter option in isolation (other filters neutral).
  // Used to hide options that would yield zero results if selected alone.
  const viableMethods = React.useMemo(() => {
    return category.decorationMethods
      .map((m) => ({
        value: m,
        count: products.filter((p) => p.decorationMethods.includes(m)).length,
      }))
      .filter((o) => o.count > 0);
  }, [category.decorationMethods, products]);

  const viableBrands = React.useMemo(() => {
    const productBrands = new Set(
      products.map((p) => p.brand).filter(Boolean) as string[],
    );
    const candidates =
      category.slug === "apparel-headwear" ? apparelBrands : Array.from(productBrands);
    return candidates
      .filter((b) => productBrands.has(b))
      .map((b) => ({
        value: b,
        count: products.filter((p) => p.brand === b).length,
      }))
      .filter((o) => o.count > 0);
  }, [category.slug, products]);

  const viableTiers = React.useMemo(() => {
    return [25, 100, 500, 1000, 5000, 10000]
      .map((t) => ({ value: t, count: products.filter((p) => p.minQty <= t).length }))
      .filter((o) => o.count > 0);
  }, [products]);

  const toggleSet = (key: "brands" | "methods", value: string) => {
    setFilters((f) => {
      const next = new Set(f[key]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...f, [key]: next };
    });
  };

  return (
    <aside className="lg:sticky lg:top-24 space-y-6">
      <div>
        <label className="relative block">
          <Icon icon="magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder={`Search ${category.name.toLowerCase()}`}
            className="w-full rounded border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {viableMethods.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft mb-3">
            Decoration method
          </h3>
          <div className="space-y-2">
            {viableMethods.map(({ value, count }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.methods.has(value)}
                  onCheckedChange={() => toggleSet("methods", value)}
                />
                <span className="text-sm capitalize text-ink-soft">
                  {value.replace(/-/g, " ")}{" "}
                  <span className="text-ink-mute font-mono">({count})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {viableBrands.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft mb-3">
            Brand
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {viableBrands.map(({ value, count }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.brands.has(value)}
                  onCheckedChange={() => toggleSet("brands", value)}
                />
                <span className="text-sm text-ink-soft">
                  {value} <span className="text-ink-mute font-mono">({count})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {viableTiers.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft mb-3">
            Quantity
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {viableTiers.map(({ value: tier, count }) => (
              <button
                key={tier}
                type="button"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    minQty: f.minQty === tier ? undefined : tier,
                  }))
                }
                className={`rounded border py-2 text-xs font-mono font-medium transition-colors ${
                  filters.minQty === tier
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-ink/15 text-ink-soft hover:border-primary/40"
                }`}
                title={`${count} matching products`}
              >
                {tier.toLocaleString()}+
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          setFilters({ search: "", brands: new Set(), methods: new Set() })
        }
        className="text-xs font-medium text-primary hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
}
