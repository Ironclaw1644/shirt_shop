"use client";

import * as React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { Icon } from "@/components/ui/icon";
import type { SampleProduct } from "@/lib/catalog/sample-products";

/**
 * Product list for a subcategory page. The server pre-slices the product
 * array to one page (24 items by default) before passing it in. Client-side
 * search filters the *current page* — so the visible search is for fast
 * "is it on this page?" lookup. Cross-page search lives on the global /search.
 */
export function SubcategoryProducts({
  products,
  subcategoryName,
  totalCount,
  currentPage,
  totalPages,
  basePath,
}: {
  products: SampleProduct[];
  subcategoryName: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  const [q, setQ] = React.useState("");
  const norm = q.trim().toLowerCase();
  const filtered = norm
    ? products.filter((p) => {
        const hay = `${p.title} ${p.shortDescription ?? ""} ${p.brand ?? ""}`.toLowerCase();
        return hay.includes(norm);
      })
    : products;

  const showPagination = totalPages > 1;
  const pageHref = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);

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
            placeholder={`Filter this page…`}
            className="h-11 w-full rounded-full border border-ink/15 bg-white pl-11 pr-4 text-sm text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <p className="text-sm text-ink-mute font-mono whitespace-nowrap">
          {showPagination
            ? `Page ${currentPage} of ${totalPages} · ${totalCount.toLocaleString()} total`
            : `Showing ${filtered.length} of ${totalCount.toLocaleString()}`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-12 text-center">
          <Icon icon="magnifying-glass" className="text-3xl text-ink-mute" />
          <p className="mt-3 font-display font-semibold">
            No matches for &ldquo;{q}&rdquo; on this page
          </p>
          <p className="text-sm text-ink-mute">
            Try a shorter keyword, browse other pages, or use the global search.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageHref={pageHref}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  pageHref,
}: {
  currentPage: number;
  totalPages: number;
  pageHref: (n: number) => string;
}) {
  const pages = pageWindow(currentPage, totalPages);
  const linkBase =
    "h-10 min-w-10 px-3 inline-flex items-center justify-center rounded border border-ink/15 text-sm font-medium hover:border-primary hover:text-primary transition-colors";
  const activeClass =
    "h-10 min-w-10 px-3 inline-flex items-center justify-center rounded border border-primary bg-primary text-white text-sm font-semibold";
  const disabledClass =
    "h-10 min-w-10 px-3 inline-flex items-center justify-center rounded border border-ink/10 text-sm font-medium text-ink-mute/50 cursor-not-allowed";

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Link href={pageHref(currentPage - 1)} className={linkBase} rel="prev">
          <Icon icon="arrow-left" /> Prev
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          <Icon icon="arrow-left" /> Prev
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-ink-mute font-mono">
            …
          </span>
        ) : p === currentPage ? (
          <span key={p} className={activeClass} aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={pageHref(p)} className={linkBase}>
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link href={pageHref(currentPage + 1)} className={linkBase} rel="next">
          Next <Icon icon="arrow-right" />
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Next <Icon icon="arrow-right" />
        </span>
      )}
    </nav>
  );
}

/** Compact page list with ellipses: 1 … 4 5 [6] 7 8 … 23 */
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}
