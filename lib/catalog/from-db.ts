import type { SampleProduct } from "./sample-products";

type DbCategory = { slug: string } | null;
type DbTier = { min_qty: number; unit_price_cents: number };

export type DbProductRow = {
  slug: string;
  brand: string | null;
  title: string;
  short_description: string | null;
  description: string | null;
  images: string[] | null;
  base_price_cents: number | null;
  price_status: "confirmed" | "placeholder" | "quote";
  min_qty: number;
  lead_time_days: number;
  decoration_methods: string[] | null;
  placement_zones: unknown;
  options: unknown;
  badges: string[] | null;
  status: "draft" | "active" | "archived";
  seo_meta: Record<string, unknown> | null;
  category: DbCategory | DbCategory[];
  subcategory: DbCategory | DbCategory[];
  price_tiers: DbTier[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function deriveHeroPromptKey(row: DbProductRow): string {
  const seoKey = row.seo_meta?.heroPromptKey;
  if (typeof seoKey === "string" && seoKey.length) return seoKey;
  const first = row.images?.[0];
  if (first) {
    const m = first.match(/\/images\/generated\/([^/]+)\.webp$/);
    if (m) return m[1];
  }
  return row.slug;
}

export function dbToSampleProduct(row: DbProductRow): SampleProduct {
  const category = pickOne(row.category);
  const subcategory = pickOne(row.subcategory);
  const tiers = (row.price_tiers ?? []).slice().sort((a, b) => a.min_qty - b.min_qty);

  return {
    slug: row.slug,
    categorySlug: (category?.slug ?? "custom-printing") as SampleProduct["categorySlug"],
    subcategorySlug: subcategory?.slug
      ? subcategory.slug.replace(/^[^-]+--/, "")
      : undefined,
    title: row.title,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    basePriceCents: row.base_price_cents,
    priceStatus: row.price_status,
    minQty: row.min_qty,
    leadTimeDays: row.lead_time_days,
    decorationMethods: row.decoration_methods ?? [],
    placementZones: Array.isArray(row.placement_zones)
      ? (row.placement_zones as SampleProduct["placementZones"])
      : undefined,
    options: row.options && typeof row.options === "object"
      ? (row.options as Record<string, string[]>)
      : undefined,
    brand: row.brand ?? undefined,
    heroPromptKey: deriveHeroPromptKey(row),
    tierBreaks: tiers.length
      ? tiers.map((t) => ({ minQty: t.min_qty, unitCents: t.unit_price_cents }))
      : undefined,
    badges: row.badges ?? undefined,
  };
}

export const PRODUCT_SELECT =
  "slug, brand, title, short_description, description, images, base_price_cents, price_status, min_qty, lead_time_days, decoration_methods, placement_zones, options, badges, status, seo_meta, category:categories!products_category_id_fkey(slug), subcategory:categories!products_subcategory_id_fkey(slug), price_tiers(min_qty, unit_price_cents)";
