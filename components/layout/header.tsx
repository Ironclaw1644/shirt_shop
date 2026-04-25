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

      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logomark animate />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Georgia Print Hub
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
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

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded text-ink-soft hover:bg-surface transition-colors"
          >
            <Icon icon="magnifying-glass" />
          </Link>
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
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded text-ink hover:bg-surface"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon icon={menuOpen ? "xmark" : "bars"} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-ink/10 bg-paper">
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

