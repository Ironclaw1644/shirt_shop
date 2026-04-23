"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useCart } from "@/lib/store/cart";
import { formatMoneyCents, formatQuantity } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

export function CartSheetTrigger() {
  const count = useCart((s) => s.count());
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open cart"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded text-ink hover:bg-surface transition-colors"
        >
          <Icon icon="bag-shopping" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-white shadow-press">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <CartPanel />
      </SheetContent>
    </Sheet>
  );
}

function CartPanel() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const updateQty = useCart((s) => s.updateQty);
  const subtotal = useCart((s) => s.subtotalCents());

  return (
    <>
      <SheetHeader className="p-6 pb-4 border-b border-ink/10">
        <SheetTitle className="flex items-center gap-2">
          <Icon icon="bag-shopping" className="text-primary" /> Your Cart
        </SheetTitle>
        <SheetDescription>
          {items.length === 0 ? "Nothing in here yet." : `${items.length} item${items.length > 1 ? "s" : ""}`}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((i) => (
              <li key={i.id} className="py-4 flex gap-3">
                <div className="h-16 w-16 shrink-0 rounded overflow-hidden bg-surface border border-ink/10 flex items-center justify-center">
                  {i.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon icon="image" className="text-ink-mute" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${i.productSlug}`}
                    className="font-display font-semibold text-ink hover:text-primary transition-colors block truncate"
                  >
                    {i.title}
                  </Link>
                  {i.variant && <p className="text-xs text-ink-mute">{i.variant}</p>}
                  {i.decoration?.method && (
                    <p className="text-xs text-accent-700 font-medium mt-1">
                      {i.decoration.method}
                      {i.decoration.placement && ` · ${i.decoration.placement}`}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm">
                      <button
                        type="button"
                        aria-label="Decrease"
                        onClick={() => updateQty(i.id, i.quantity - 1)}
                        className="h-7 w-7 rounded border border-ink/15 hover:border-primary"
                      >
                        −
                      </button>
                      <span className="font-mono w-10 text-center">{formatQuantity(i.quantity)}</span>
                      <button
                        type="button"
                        aria-label="Increase"
                        onClick={() => updateQty(i.id, i.quantity + 1)}
                        className="h-7 w-7 rounded border border-ink/15 hover:border-primary"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-semibold">
                        {formatMoneyCents(i.unitPriceCents * i.quantity)}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(i.id)}
                        className="text-xs text-ink-mute hover:text-primary"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className={cn("border-t border-ink/10 p-6 bg-paper-warm space-y-4")}>
          <div className="flex items-center justify-between font-display text-lg">
            <span className="text-ink-mute">Subtotal</span>
            <span className="font-bold">{formatMoneyCents(subtotal)}</span>
          </div>
          <p className="text-xs text-ink-mute">
            Taxes + shipping calculated at checkout. For runs over 5,000, request a volume quote
            for tier pricing.
          </p>
          <div className="grid gap-2">
            <Button asChild size="lg">
              <Link href="/checkout">
                Checkout <Icon icon="arrow-right" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/quote">Need 5,000+? Request a quote</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-surface flex items-center justify-center">
        <Icon icon="bag-shopping" className="text-2xl text-ink-mute" />
      </div>
      <p className="font-display text-lg font-semibold text-ink">Your cart is empty</p>
      <p className="text-sm text-ink-mute mt-1">
        Browse cards, apparel, awards, drinkware, and more.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs max-w-[240px] mx-auto">
        <Link
          href="/custom-printing"
          className="rounded border border-ink/10 py-2 hover:border-primary hover:text-primary"
        >
          Printing
        </Link>
        <Link
          href="/apparel-headwear"
          className="rounded border border-ink/10 py-2 hover:border-primary hover:text-primary"
        >
          Apparel
        </Link>
        <Link
          href="/drinkware"
          className="rounded border border-ink/10 py-2 hover:border-primary hover:text-primary"
        >
          Drinkware
        </Link>
        <Link
          href="/personalized-gifts"
          className="rounded border border-ink/10 py-2 hover:border-primary hover:text-primary"
        >
          Gifts
        </Link>
      </div>
    </div>
  );
}
