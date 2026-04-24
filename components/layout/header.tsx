"use client";

import Link from "next/link";
import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { categories } from "@/lib/catalog/categories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { CartSheetTrigger } from "@/components/shop/cart-sheet";

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
          <Logomark />
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

function Logomark() {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center">
      <svg
        viewBox="0 0 40 40"
        aria-hidden
        className="h-10 w-10 transform -rotate-6 transition-transform duration-300 group-hover:-rotate-12"
      >
        <rect x="2" y="2" width="36" height="36" rx="8" fill="#1A1A1A" />
        <rect x="6" y="6" width="28" height="28" rx="5" fill="#FAFAF7" />
        {/* Georgia state outline — US Census boundary data, shifted down for optical centering */}
        <g transform="translate(0 1.5)">
          <path
            d="M20.58 7.0 L19.68 8.1 L19.61 8.64 L21.02 9.74 L21.46 9.66 L22.11 10.79 L22.25 11.39 L22.93 12.46 L23.9 13.11 L24.46 14.08 L25.59 14.95 L25.55 15.55 L26.29 16.51 L27.43 17.3 L27.7 18.15 L27.75 19.25 L28.33 19.62 L29.0 21.01 L29.03 21.89 L30.0 22.34 L28.96 24.1 L28.77 25.0 L28.33 25.79 L28.28 26.61 L27.82 26.98 L27.64 29.19 L26.48 28.99 L25.5 28.57 L25.11 28.96 L25.27 29.93 L25.08 30.97 L24.57 31.0 L24.36 29.9 L18.93 29.5 L13.13 29.16 L12.55 27.66 L12.09 26.25 L12.39 24.89 L11.97 23.33 L12.34 22.45 L12.32 21.8 L13.04 21.15 L12.55 20.84 L12.74 20.33 L12.28 19.51 L11.79 18.07 L10.74 11.53 L10.0 7.08 L15.45 7.06 L18.42 7.08 L20.58 7.0 Z"
            fill="none"
            stroke="#B8142B"
            strokeWidth="1.7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Atlanta — 5-point star, outer radius 1.5 centered at (15.16, 13.47) */}
          <polygon
            points="15.16,11.97 15.51,12.985 16.58,13.01 15.73,13.655 16.04,14.68 15.16,14.07 14.28,14.68 14.59,13.655 13.74,13.01 14.81,12.985"
            fill="#D4A017"
          />
        </g>
      </svg>
    </span>
  );
}
