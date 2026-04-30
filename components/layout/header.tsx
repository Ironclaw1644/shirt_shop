"use client";

import Link from "next/link";
import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { categories } from "@/lib/catalog/categories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { CartSheetTrigger } from "@/components/shop/cart-sheet";
import { Logomark } from "@/components/brand/logomark";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-paper/95 backdrop-blur-md border-b border-ink/10 shadow-[0_2px_0_rgba(0,0,0,0.02)]"
          : "bg-paper border-b border-transparent",
      )}
    >
      {/* announcement bar */}
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

        <nav className="hidden xl:flex items-center gap-1 shrink-0" aria-label="Primary">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="relative px-3 py-2 rounded text-sm font-medium text-ink-soft transition-colors hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </nav>

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
        <div className="xl:hidden border-t border-ink/10 bg-paper">
          <nav className="container py-4 grid gap-1" aria-label="Mobile primary">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="flex items-center justify-between rounded px-3 py-3 text-ink hover:bg-surface"
                onClick={() => setMenuOpen(false)}
              >
                <span className="font-medium">{c.name}</span>
                <Icon icon="chevron-right" className="text-ink-mute" />
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/account" onClick={() => setMenuOpen(false)}>
                  Account
                </Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href="/quote" onClick={() => setMenuOpen(false)}>
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

