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

  const allBrands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean)),
  ) as string[];
  const relevantBrands =
    category.slug === "apparel-headwear" ? apparelBrands : allBrands;
  const brandSample = relevantBrands.slice(0, 12);

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

      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft mb-3">
          Decoration method
        </h3>
        <div className="space-y-2">
          {category.decorationMethods.map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.methods.has(m)}
                onCheckedChange={() => toggleSet("methods", m)}
              />
              <span className="text-sm capitalize text-ink-soft">
                {m.replace(/-/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

      {brandSample.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft mb-3">
            Brand
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {brandSample.map((b) => (
              <label key={b} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.brands.has(b)}
                  onCheckedChange={() => toggleSet("brands", b)}
                />
                <span className="text-sm text-ink-soft">{b}</span>
              </label>
            ))}
            {relevantBrands.length > brandSample.length && (
              <p className="text-xs text-ink-mute">
                + {relevantBrands.length - brandSample.length} more brands
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft mb-3">
          Quantity
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[25, 100, 500, 1000, 5000, 10000].map((tier) => (
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
            >
              {tier.toLocaleString()}+
            </button>
          ))}
        </div>
      </div>

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
