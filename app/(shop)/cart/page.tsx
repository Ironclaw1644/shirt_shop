"use client";

import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatMoneyCents, formatQuantity } from "@/lib/utils/money";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const updateQty = useCart((s) => s.updateQty);
  const subtotal = useCart((s) => s.subtotalCents());

  return (
    <div className="container py-12">
      <Breadcrumbs crumbs={[{ label: "Shop", href: "/" }, { label: "Cart" }]} />
      <h1 className="heading-display mt-6 text-4xl sm:text-5xl">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-ink/20 bg-paper-warm p-12 text-center max-w-xl mx-auto">
          <Icon icon="bag-shopping" className="text-3xl text-ink-mute" />
          <p className="mt-3 font-display font-semibold">Your cart is empty.</p>
          <p className="mt-1 text-sm text-ink-mute">
            Start with business cards, a hoodie, or an engraved tumbler.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Browse catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,360px]">
          <ul className="divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
            {items.map((i) => (
              <li key={i.id} className="p-4 sm:p-6 flex gap-4">
                <div className="h-24 w-24 shrink-0 rounded overflow-hidden bg-surface border border-ink/10">
                  {i.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${i.productSlug}`}
                    className="font-display font-semibold text-lg text-ink hover:text-primary"
                  >
                    {i.title}
                  </Link>
                  {i.variant && <p className="text-sm text-ink-mute">{i.variant}</p>}
                  {i.decoration?.method && (
                    <p className="text-sm text-accent-700 font-medium mt-1">
                      Decoration: {i.decoration.method}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(i.id, i.quantity - 1)}
                        className="h-8 w-8 rounded border border-ink/15 hover:border-primary"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={i.quantity}
                        onChange={(e) => updateQty(i.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-center border border-ink/15 rounded font-mono"
                      />
                      <button
                        onClick={() => updateQty(i.id, i.quantity + 1)}
                        className="h-8 w-8 rounded border border-ink/15 hover:border-primary"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(i.id)}
                      className="text-sm text-ink-mute hover:text-primary"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-lg">
                    {formatMoneyCents(i.unitPriceCents * i.quantity)}
                  </div>
                  <div className="text-xs text-ink-mute">
                    {formatMoneyCents(i.unitPriceCents)} × {formatQuantity(i.quantity)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24 rounded-lg border border-ink/10 bg-paper-warm p-6 h-fit shadow-press">
            <h2 className="font-display text-xl font-bold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-mute">Subtotal</dt>
                <dd className="font-mono">{formatMoneyCents(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-mute">Tax</dt>
                <dd className="text-ink-mute">calculated at checkout</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-mute">Shipping</dt>
                <dd className="text-ink-mute">calculated at checkout</dd>
              </div>
            </dl>
            <div className="my-4 h-px bg-ink/10" />
            <div className="flex items-center justify-between font-display text-xl">
              <span>Total</span>
              <span className="font-bold">{formatMoneyCents(subtotal)}+</span>
            </div>
            <Button asChild size="lg" className="mt-5 w-full">
              <Link href="/checkout">
                Secure checkout <Icon icon="arrow-right" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/quote">
                Need 5,000+? Request a quote
              </Link>
            </Button>
            <p className="mt-4 text-xs text-ink-mute">
              No payment is collected at checkout — we&rsquo;ll email an itemized invoice once
              we&rsquo;ve reviewed your order. All jobs require proof approval before production.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
