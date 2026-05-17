import * as React from "react";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { formatMoneyCents } from "@/lib/utils/money";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { categories as staticCategories } from "@/lib/catalog/categories";
import { sampleProducts } from "@/lib/catalog/sample-products";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  base_price_cents: number | null;
  price_status: string;
  status: string;
  min_qty: number;
  brand: string | null;
};

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const supa = await getSupabaseServerClient();
  const q = (sp.q ?? "").trim();

  // Load all products (no limit — we have ~10k and the customer site shows them all).
  // Use ranged fetch to bypass PostgREST's default 1000-row cap.
  const baseQuery = supa
    .from("products")
    .select(
      "id, slug, title, base_price_cents, price_status, status, min_qty, brand",
    )
    .order("title", { ascending: true });

  let products: ProductRow[] = [];
  if (q) {
    const { data } = await baseQuery.or(
      `title.ilike.%${q}%,brand.ilike.%${q}%,slug.ilike.%${q}%`,
    );
    products = (data ?? []) as ProductRow[];
  } else {
    // Page through all rows. Supabase caps at 1000 per request.
    const PAGE = 1000;
    for (let from = 0; from < 50_000; from += PAGE) {
      const { data, error } = await baseQuery.range(from, from + PAGE - 1);
      if (error) break;
      const chunk = (data ?? []) as ProductRow[];
      products.push(...chunk);
      if (chunk.length < PAGE) break;
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle={`${products.length.toLocaleString()} ${products.length === 1 ? "product" : "products"}${q ? ` matching "${q}"` : " — organized to match the public site"}`}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Icon icon="bolt" /> New product
            </Link>
          </Button>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        <form method="get" className="flex flex-wrap gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0 sm:flex-none sm:w-96">
            <Icon
              icon="magnifying-glass"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
            />
            <input
              id="admin-search"
              name="q"
              defaultValue={q}
              placeholder="Search products by title, brand, or slug…"
              className="h-10 w-full rounded border border-ink/15 bg-white pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button className="h-10 rounded bg-ink text-paper px-4 text-sm">
            Search
          </button>
          {q && (
            <Link
              href="/admin/products"
              className="h-10 inline-flex items-center rounded border border-ink/15 px-3 text-sm text-ink-soft hover:border-primary"
            >
              Clear
            </Link>
          )}
        </form>

        {q ? (
          <FlatTable rows={products} />
        ) : (
          <CatalogHierarchy products={products} />
        )}
      </div>
    </div>
  );
}

/**
 * Renders products grouped exactly like the public site: top-level order comes
 * from `lib/catalog/categories` (same source of truth the storefront uses),
 * with subcategories and (where defined) third-level subsubcategories
 * underneath. DB products are mapped in by slug. DB-only products whose slug
 * isn't in the static catalog are not displayed here — they're invisible to
 * the public site anyway. To surface them, add their slugs to
 * `lib/catalog/sample-products.ts`.
 */
function CatalogHierarchy({ products }: { products: ProductRow[] }) {
  // Index DB products by slug so each public-catalog entry can resolve to its
  // editable row (or show "not in DB" if the seed missed it).
  const dbBySlug = new Map<string, ProductRow>();
  for (const p of products) dbBySlug.set(p.slug, p);

  // Pre-bucket sampleProducts by category → subcategory → subsubcategory so we
  // can render in one pass without re-scanning the 10k-row array per group.
  type LeafKey = string; // `${catSlug}::${subSlug}::${subsubSlug || ""}`
  const productsByLeaf = new Map<LeafKey, string[]>(); // → product slugs (alpha by title)
  for (const sp of sampleProducts) {
    const key: LeafKey = `${sp.categorySlug}::${sp.subcategorySlug ?? ""}::${sp.subsubcategorySlug ?? ""}`;
    const arr = productsByLeaf.get(key) ?? [];
    arr.push(sp.slug);
    productsByLeaf.set(key, arr);
  }
  // Title-alpha sort within each leaf, matching the public nav-tree.
  for (const slugs of productsByLeaf.values()) {
    slugs.sort((a, b) => {
      const ta = dbBySlug.get(a)?.title ?? a;
      const tb = dbBySlug.get(b)?.title ?? b;
      return ta.localeCompare(tb);
    });
  }

  function leafSlugs(
    catSlug: string,
    subSlug: string | "",
    subsubSlug: string | "",
  ): string[] {
    return productsByLeaf.get(`${catSlug}::${subSlug}::${subsubSlug}`) ?? [];
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-ink/10 bg-white">
        <Accordion type="multiple" className="px-4 sm:px-6">
          {staticCategories.map((cat) => {
            // Total count for this top-level: sum of all leaves under it.
            let catCount = 0;
            for (const sub of cat.subcategories) {
              if (sub.subcategories && sub.subcategories.length > 0) {
                for (const subsub of sub.subcategories) {
                  catCount += leafSlugs(cat.slug, sub.slug, subsub.slug).length;
                }
              } else {
                catCount += leafSlugs(cat.slug, sub.slug, "").length;
              }
              // Also count products directly under the sub with no subsubcategory
              // even when subsubs exist (defensive — sample-products may have both).
              if (sub.subcategories && sub.subcategories.length > 0) {
                catCount += leafSlugs(cat.slug, sub.slug, "").length;
              }
            }

            return (
              <AccordionItem key={cat.slug} value={cat.slug}>
                <AccordionTrigger className="text-left">
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="font-display font-bold truncate">
                      {cat.name}
                    </span>
                    <span className="text-xs font-mono text-ink-mute">
                      {catCount.toLocaleString()}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-3">
                    {cat.subcategories.map((sub) => {
                      const hasSubsubs =
                        !!sub.subcategories && sub.subcategories.length > 0;

                      // Direct products under this sub (no subsub specified)
                      const directSlugs = leafSlugs(cat.slug, sub.slug, "");
                      const subsubTotal = hasSubsubs
                        ? sub.subcategories!.reduce(
                            (acc, ss) =>
                              acc + leafSlugs(cat.slug, sub.slug, ss.slug).length,
                            0,
                          )
                        : 0;
                      const subTotal = directSlugs.length + subsubTotal;
                      if (subTotal === 0) return null;

                      return (
                        <div
                          key={`${cat.slug}--${sub.slug}`}
                          className="rounded border border-ink/5 bg-paper-warm/30"
                        >
                          <div className="px-3 sm:px-4 py-2 border-b border-ink/5 flex items-center justify-between gap-3">
                            <span className="font-display font-semibold text-sm">
                              {sub.name}
                            </span>
                            <span className="text-xs font-mono text-ink-mute">
                              {subTotal.toLocaleString()}
                            </span>
                          </div>

                          {hasSubsubs ? (
                            <div className="divide-y divide-ink/5">
                              {sub.subcategories!.map((subsub) => {
                                const slugs = leafSlugs(
                                  cat.slug,
                                  sub.slug,
                                  subsub.slug,
                                );
                                if (slugs.length === 0) return null;
                                return (
                                  <LeafGroup
                                    key={`${cat.slug}--${sub.slug}--${subsub.slug}`}
                                    label={subsub.name}
                                    productSlugs={slugs}
                                    dbBySlug={dbBySlug}
                                    depth={2}
                                  />
                                );
                              })}
                              {directSlugs.length > 0 && (
                                <LeafGroup
                                  label="(uncategorized in this section)"
                                  productSlugs={directSlugs}
                                  dbBySlug={dbBySlug}
                                  depth={2}
                                />
                              )}
                            </div>
                          ) : (
                            <LeafGroup
                              label={null}
                              productSlugs={directSlugs}
                              dbBySlug={dbBySlug}
                              depth={1}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

    </div>
  );
}

function LeafGroup({
  label,
  productSlugs,
  dbBySlug,
  depth,
}: {
  label: string | null;
  productSlugs: string[];
  dbBySlug: Map<string, ProductRow>;
  depth: 1 | 2;
}) {
  const rows: { slug: string; row?: ProductRow }[] = productSlugs.map((s) => ({
    slug: s,
    row: dbBySlug.get(s),
  }));

  return (
    <div className={depth === 2 ? "py-2" : ""}>
      {label && (
        <div className="px-3 sm:px-4 pt-2 pb-1 text-[11px] font-mono uppercase tracking-widest text-ink-mute">
          {label}{" "}
          <span className="text-ink-mute/70">· {productSlugs.length}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <tbody>
            {rows.map(({ slug, row }) =>
              row ? (
                <Row key={slug} p={row} indent />
              ) : (
                <tr
                  key={slug}
                  className="border-t border-ink/5 text-ink-mute"
                  title="Defined in the public catalog but missing from the database. Run the seed script to sync."
                >
                  <td className="pl-8 sm:pl-10 pr-4 py-2.5 font-mono text-xs">
                    {slug}
                  </td>
                  <td className="px-4 py-2.5">—</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="warning">not in DB</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">—</td>
                  <td className="px-4 py-2.5 text-right font-mono">—</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FlatTable({ rows }: { rows: ProductRow[] }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
          <tr>
            <th className="text-left px-4 py-3">Title</th>
            <th className="text-left px-4 py-3">Brand</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Base price</th>
            <th className="text-right px-4 py-3">Min qty</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <Row key={p.id} p={p} />
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-ink-mute"
              >
                No products match.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Row({ p, indent }: { p: ProductRow; indent?: boolean }) {
  return (
    <tr className="border-t border-ink/10 hover:bg-paper-warm transition-colors">
      <td className={`py-2.5 ${indent ? "pl-8 sm:pl-10 pr-4" : "px-4"}`}>
        <Link
          href={`/admin/products/${p.id}`}
          className="font-display font-semibold text-primary hover:underline"
        >
          {p.title}
        </Link>
      </td>
      <td className="px-4 py-2.5">{p.brand ?? "—"}</td>
      <td className="px-4 py-2.5">
        <Badge variant={p.status === "active" ? "success" : "paper"}>
          {p.status}
        </Badge>
        {p.price_status === "placeholder" && (
          <Badge variant="warning" className="ml-1">
            placeholder
          </Badge>
        )}
      </td>
      <td className="px-4 py-2.5 text-right font-mono">
        {formatMoneyCents(p.base_price_cents ?? null)}
      </td>
      <td className="px-4 py-2.5 text-right font-mono">{p.min_qty}</td>
    </tr>
  );
}
