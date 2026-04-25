import * as React from "react";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { formatMoneyCents } from "@/lib/utils/money";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  base_price_cents: number | null;
  price_status: string;
  status: string;
  min_qty: number;
  brand: string | null;
  category_id: string | null;
  subcategory_id: string | null;
};

type CategoryRow = { id: string; slug: string; name: string; parent_id: string | null; sort_order: number };

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const supa = await getSupabaseServerClient();
  const q = (sp.q ?? "").trim();

  const productsQuery = supa
    .from("products")
    .select(
      "id, slug, title, base_price_cents, price_status, status, min_qty, brand, category_id, subcategory_id",
    )
    .order("title", { ascending: true })
    .limit(2000);

  const filteredQuery = q
    ? productsQuery.or(`title.ilike.%${q}%,brand.ilike.%${q}%,slug.ilike.%${q}%`)
    : productsQuery;

  const [{ data: products }, { data: categories }] = await Promise.all([
    filteredQuery,
    supa.from("categories").select("id, slug, name, parent_id, sort_order").order("sort_order", { ascending: true }),
  ]);

  const cats = (categories ?? []) as CategoryRow[];
  const topCats = cats.filter((c) => !c.parent_id);
  const byParent = new Map<string, CategoryRow[]>();
  for (const c of cats.filter((c) => c.parent_id)) {
    const arr = byParent.get(c.parent_id!) ?? [];
    arr.push(c);
    byParent.set(c.parent_id!, arr);
  }

  const productList = (products ?? []) as ProductRow[];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle={`${productList.length} ${productList.length === 1 ? "product" : "products"}${q ? ` matching "${q}"` : ""}`}
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
            <Icon icon="magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input
              id="admin-search"
              name="q"
              defaultValue={q}
              placeholder="Search products by title, brand, or slug…"
              className="h-10 w-full rounded border border-ink/15 bg-white pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button className="h-10 rounded bg-ink text-paper px-4 text-sm">Search</button>
          {q && (
            <Link href="/admin/products" className="h-10 inline-flex items-center rounded border border-ink/15 px-3 text-sm text-ink-soft hover:border-primary">
              Clear
            </Link>
          )}
        </form>

        {q ? (
          <FlatTable rows={productList} />
        ) : (
          <CategorizedAccordion topCats={topCats} byParent={byParent} products={productList} />
        )}
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
          {rows.map((p) => <Row key={p.id} p={p} />)}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-mute">No products match.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CategorizedAccordion({
  topCats,
  byParent,
  products,
}: {
  topCats: CategoryRow[];
  byParent: Map<string, CategoryRow[]>;
  products: ProductRow[];
}) {
  // bucket products by top-level category id; uncategorized go in "(Uncategorized)"
  const productsByCat = new Map<string, ProductRow[]>();
  const uncategorized: ProductRow[] = [];
  for (const p of products) {
    if (!p.category_id) {
      uncategorized.push(p);
      continue;
    }
    const arr = productsByCat.get(p.category_id) ?? [];
    arr.push(p);
    productsByCat.set(p.category_id, arr);
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white">
      <Accordion type="multiple" className="px-4 sm:px-6">
        {topCats.map((cat) => {
          const catProducts = productsByCat.get(cat.id) ?? [];
          if (catProducts.length === 0) {
            return (
              <AccordionItem key={cat.id} value={cat.id}>
                <AccordionTrigger className="text-left">
                  <span className="flex items-center gap-3">
                    {cat.name}
                    <span className="text-xs font-mono text-ink-mute">0</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-ink-mute text-sm pb-2">No products in this category yet.</p>
                </AccordionContent>
              </AccordionItem>
            );
          }
          // group inside category by subcategory
          const subs = byParent.get(cat.id) ?? [];
          const subBuckets = new Map<string, ProductRow[]>();
          const noSub: ProductRow[] = [];
          for (const p of catProducts) {
            if (!p.subcategory_id) {
              noSub.push(p);
              continue;
            }
            const arr = subBuckets.get(p.subcategory_id) ?? [];
            arr.push(p);
            subBuckets.set(p.subcategory_id, arr);
          }
          return (
            <AccordionItem key={cat.id} value={cat.id}>
              <AccordionTrigger className="text-left">
                <span className="flex items-center gap-3">
                  {cat.name}
                  <span className="text-xs font-mono text-ink-mute">{catProducts.length}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                  <table className="w-full min-w-[640px] text-sm">
                    <tbody>
                      {subs.map((sub) => {
                        const rows = subBuckets.get(sub.id);
                        if (!rows || rows.length === 0) return null;
                        return (
                          <React.Fragment key={sub.id}>
                            <tr>
                              <td colSpan={5} className="px-4 sm:px-6 pt-3 pb-2 text-xs font-mono uppercase tracking-widest text-ink-mute bg-paper-warm/40">
                                {sub.name} <span className="text-ink-mute/70">· {rows.length}</span>
                              </td>
                            </tr>
                            {rows.map((p) => <Row key={p.id} p={p} indent />)}
                          </React.Fragment>
                        );
                      })}
                      {noSub.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={5} className="px-4 sm:px-6 pt-3 pb-2 text-xs font-mono uppercase tracking-widest text-ink-mute bg-paper-warm/40">
                              No subcategory <span className="text-ink-mute/70">· {noSub.length}</span>
                            </td>
                          </tr>
                          {noSub.map((p) => <Row key={p.id} p={p} indent />)}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      {uncategorized.length > 0 && (
        <div className="border-t border-ink/10 p-4">
          <p className="font-display font-bold mb-2">Uncategorized · {uncategorized.length}</p>
          <table className="w-full text-sm"><tbody>{uncategorized.map((p) => <Row key={p.id} p={p} />)}</tbody></table>
        </div>
      )}
    </div>
  );
}

function Row({ p, indent }: { p: ProductRow; indent?: boolean }) {
  return (
    <tr className="border-t border-ink/10 hover:bg-paper-warm transition-colors">
      <td className={`py-2.5 ${indent ? "pl-8 sm:pl-10 pr-4" : "px-4"}`}>
        <Link href={`/admin/products/${p.id}`} className="font-display font-semibold text-primary hover:underline">
          {p.title}
        </Link>
      </td>
      <td className="px-4 py-2.5">{p.brand ?? "—"}</td>
      <td className="px-4 py-2.5">
        <Badge variant={p.status === "active" ? "success" : "paper"}>{p.status}</Badge>
        {p.price_status === "placeholder" && (
          <Badge variant="warning" className="ml-1">placeholder</Badge>
        )}
      </td>
      <td className="px-4 py-2.5 text-right font-mono">{formatMoneyCents(p.base_price_cents ?? null)}</td>
      <td className="px-4 py-2.5 text-right font-mono">{p.min_qty}</td>
    </tr>
  );
}
