"use client";

import Link from "next/link";
import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { CartSheetTrigger } from "@/components/shop/cart-sheet";
import { Logomark } from "@/components/brand/logomark";
import type { NavCategory } from "@/lib/catalog/nav-tree";

export function SiteHeaderClient({ navTree }: { navTree: NavCategory[] }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [openCat, setOpenCat] = React.useState<string | null>(null);
  const [openSub, setOpenSub] = React.useState<string | null>(null);
  const [mobileOpenCat, setMobileOpenCat] = React.useState<string | null>(null);
  const [mobileOpenSub, setMobileOpenSub] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!openCat) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCat(null);
        setOpenSub(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenCat(null);
        setOpenSub(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openCat]);

  const closeAll = () => {
    setOpenCat(null);
    setOpenSub(null);
    setMenuOpen(false);
    setMobileOpenCat(null);
    setMobileOpenSub(null);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-paper/95 backdrop-blur-md border-b border-ink/10 shadow-[0_2px_0_rgba(0,0,0,0.02)]"
          : "bg-paper border-b border-transparent",
      )}
    >
      <div className="bg-ink text-paper text-xs">
        <div className="container flex h-8 items-center justify-between">
          <span className="hidden sm:inline font-mono tracking-wide">
            Locally printed in Georgia · Same-day &amp; few-hour turns on many jobs
          </span>
          <span className="sm:hidden font-mono tracking-wide">Made in GA · same-day turns</span>
          <Link
            href="/quote"
            className="underline decoration-accent decoration-2 underline-offset-[3px] hover:text-accent transition-colors"
          >
            Request a volume quote →
          </Link>
        </div>
      </div>

      <div className="container flex h-16 items-center gap-4 sm:gap-6">
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <Logomark animate />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Georgia Print Hub
          </span>
        </Link>

        <div ref={navRef} className="hidden xl:block relative">
          <nav className="flex items-center gap-1 shrink-0" aria-label="Primary">
            {navTree.map((c) => {
              const isOpen = openCat === c.slug;
              return (
                <div key={c.slug} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      setOpenCat(isOpen ? null : c.slug);
                      setOpenSub(null);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                      isOpen ? "text-primary" : "text-ink-soft hover:text-primary",
                    )}
                  >
                    {c.name}
                    <Icon
                      icon="chevron-down"
                      className={cn(
                        "text-xs transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </nav>

          {openCat && (
            <DesktopDropdown
              category={navTree.find((c) => c.slug === openCat)!}
              openSub={openSub}
              setOpenSub={setOpenSub}
              onNavigate={closeAll}
            />
          )}
        </div>

        <form
          action="/search"
          method="get"
          role="search"
          className="hidden sm:flex flex-1 min-w-0 max-w-md xl:max-w-sm xl:ml-auto"
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <div className="relative w-full">
            <Icon
              icon="magnifying-glass"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
            />
            <input
              id="site-search"
              type="search"
              name="q"
              placeholder="What are you looking for?"
              autoComplete="off"
              className="h-10 w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 text-sm placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            />
          </div>
        </form>

        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto sm:ml-0 shrink-0">
          <button
            type="button"
            className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded text-ink-soft hover:bg-surface"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Icon icon={searchOpen ? "xmark" : "magnifying-glass"} />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded text-ink-soft hover:bg-surface transition-colors"
          >
            <Icon icon="user" />
          </Link>
          <CartSheetTrigger />
          <Button asChild variant="primary" size="sm" className="hidden sm:inline-flex">
            <Link href="/quote">
              <Icon icon="bolt" /> Quote
            </Link>
          </Button>
          <button
            type="button"
            className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded text-ink hover:bg-surface"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon icon={menuOpen ? "xmark" : "bars"} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="sm:hidden border-t border-ink/10 bg-paper">
          <form action="/search" method="get" role="search" className="container py-3">
            <label htmlFor="site-search-mobile" className="sr-only">
              Search products
            </label>
            <div className="relative w-full">
              <Icon
                icon="magnifying-glass"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
              />
              <input
                id="site-search-mobile"
                type="search"
                name="q"
                placeholder="What are you looking for?"
                autoComplete="off"
                autoFocus
                className="h-11 w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 text-base placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              />
            </div>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="xl:hidden border-t border-ink/10 bg-paper max-h-[70vh] overflow-y-auto">
          <nav className="container py-2" aria-label="Mobile primary">
            {navTree.map((c) => {
              const catOpen = mobileOpenCat === c.slug;
              const hasSubs = c.subcategories.length > 0;
              return (
                <div key={c.slug} className="border-b border-ink/5 last:border-0">
                  <div className="flex items-stretch">
                    <Link
                      href={`/${c.slug}`}
                      onClick={closeAll}
                      className="flex-1 flex items-center px-3 py-3 text-ink hover:bg-surface font-medium"
                    >
                      {c.name}
                    </Link>
                    <button
                      type="button"
                      aria-label={catOpen ? `Hide ${c.name} subcategories` : `Show ${c.name} subcategories`}
                      aria-expanded={catOpen}
                      onClick={() => {
                        setMobileOpenCat(catOpen ? null : c.slug);
                        setMobileOpenSub(null);
                      }}
                      className="px-4 flex items-center text-ink-mute hover:text-primary hover:bg-surface"
                    >
                      <Icon
                        icon="chevron-down"
                        className={cn("transition-transform", catOpen && "rotate-180")}
                      />
                    </button>
                  </div>
                  {catOpen && !hasSubs && (
                    <div className="px-4 pb-3 text-sm text-ink-mute">
                      Coming soon — check back as we expand this category.
                    </div>
                  )}
                  {catOpen && hasSubs && (
                    <div className="bg-surface/40 pb-2">
                      {c.subcategories.map((s) => {
                        const subOpen = mobileOpenSub === s.slug;
                        return (
                          <div key={s.slug} className="ml-3 border-l border-ink/10 pl-3 my-1">
                            <div className="flex items-stretch">
                              <Link
                                href={`/${c.slug}/${s.slug}`}
                                onClick={closeAll}
                                className="flex-1 flex items-center px-2 py-2 text-sm text-ink-soft hover:text-primary"
                              >
                                {s.name}
                                <span className="ml-2 text-xs text-ink-mute">({s.products.length})</span>
                              </Link>
                              <button
                                type="button"
                                aria-label={subOpen ? `Hide ${s.name} products` : `Show ${s.name} products`}
                                aria-expanded={subOpen}
                                onClick={() => setMobileOpenSub(subOpen ? null : s.slug)}
                                className="px-3 flex items-center text-ink-mute hover:text-primary"
                              >
                                <Icon
                                  icon="chevron-down"
                                  className={cn("text-xs transition-transform", subOpen && "rotate-180")}
                                />
                              </button>
                            </div>
                            {subOpen && (
                              <ul className="ml-3 border-l border-ink/10 pl-3 py-1 grid gap-0.5">
                                {s.products.map((p) => (
                                  <li key={p.slug}>
                                    <Link
                                      href={`/product/${p.slug}`}
                                      onClick={closeAll}
                                      className="block py-1.5 text-sm text-ink-mute hover:text-primary"
                                    >
                                      {p.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-3 grid grid-cols-2 gap-2 px-3 pb-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/account" onClick={closeAll}>
                  Account
                </Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href="/quote" onClick={closeAll}>
                  Request Quote
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function DesktopDropdown({
  category,
  openSub,
  setOpenSub,
  onNavigate,
}: {
  category: NavCategory;
  openSub: string | null;
  setOpenSub: (slug: string | null) => void;
  onNavigate: () => void;
}) {
  return (
    <div
      className="absolute left-0 top-full mt-1 w-[680px] max-w-[calc(100vw-2rem)] rounded-lg border border-ink/10 bg-paper shadow-xl z-50"
      role="menu"
    >
      <div className="px-5 pt-4 pb-2 border-b border-ink/5 flex items-baseline gap-3">
        <Link
          href={`/${category.slug}`}
          onClick={onNavigate}
          className="font-display text-lg font-bold text-ink hover:text-primary"
        >
          All {category.name}
        </Link>
        <span className="text-xs text-ink-mute">{category.tagline}</span>
      </div>
      {category.subcategories.length === 0 ? (
        <div className="px-5 py-6 text-sm text-ink-mute">
          Coming soon — check back as we expand this category.
        </div>
      ) : (
        <ul className="p-2 max-h-[70vh] overflow-y-auto">
          {category.subcategories.map((s) => {
            const isOpen = openSub === s.slug;
            return (
              <li key={s.slug}>
                <div className="flex items-stretch rounded hover:bg-surface">
                  <Link
                    href={`/${category.slug}/${s.slug}`}
                    onClick={onNavigate}
                    className="flex-1 flex items-center justify-between px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-ink">{s.name}</span>
                    <span className="text-xs text-ink-mute">{s.products.length}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label={isOpen ? `Hide ${s.name} products` : `Show ${s.name} products`}
                    aria-expanded={isOpen}
                    onClick={() => setOpenSub(isOpen ? null : s.slug)}
                    className="px-3 flex items-center text-ink-mute hover:text-primary"
                  >
                    <Icon
                      icon="chevron-down"
                      className={cn("text-xs transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                </div>
                {isOpen && (
                  <ul className="ml-3 mt-1 mb-2 border-l border-ink/10 pl-3 grid grid-cols-2 gap-x-3 gap-y-0.5">
                    {s.products.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/product/${p.slug}`}
                          onClick={onNavigate}
                          className="block py-1 text-sm text-ink-soft hover:text-primary"
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
