"use client";

import { useCart } from "@/lib/store/cart";
import { formatMoneyCents, formatQuantity } from "@/lib/utils/money";

export function CheckoutSummary() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotalCents());
  return (
    <aside className="h-fit lg:sticky lg:top-24 rounded-lg border border-ink/10 bg-paper-warm p-6 shadow-press">
      <h2 className="font-display text-xl font-bold">Order summary</h2>
      <ul className="mt-4 space-y-3 max-h-[320px] overflow-y-auto">
        {items.map((i) => (
          <li key={i.id} className="flex gap-3 text-sm">
            <div className="h-14 w-14 shrink-0 rounded overflow-hidden bg-surface border border-ink/10">
              {i.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.image} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-ink line-clamp-1">{i.title}</p>
              <p className="text-xs text-ink-mute">
                {formatQuantity(i.quantity)} × {formatMoneyCents(i.unitPriceCents)}
              </p>
            </div>
            <span className="font-mono">{formatMoneyCents(i.unitPriceCents * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-1.5 text-sm border-t border-ink/10 pt-4">
        <div className="flex justify-between">
          <span className="text-ink-mute">Subtotal</span>
          <span className="font-mono">{formatMoneyCents(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-mute">Shipping</span>
          <span className="text-ink-mute">Calculated</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-mute">Tax</span>
          <span className="text-ink-mute">Calculated</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between font-display text-lg">
        <span>Total</span>
        <span className="font-bold">{formatMoneyCents(subtotal)}+</span>
      </div>
    </aside>
  );
}
