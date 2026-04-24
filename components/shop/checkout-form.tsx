"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatMoneyCents } from "@/lib/utils/money";

export function CheckoutForm() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotalCents());
  const clearCart = useCart((s) => s.clear);
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function placeOrder() {
    if (!email || items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, items, shippingCents: 0, taxCents: 0 }),
      });
      const data = await res.json();
      if (!res.ok || !data.orderId) {
        throw new Error(data.error ?? "Unable to place order");
      }
      clearCart();
      router.push(`/account/orders/${data.orderId}`);
    } catch (err) {
      toast.error("Something went wrong", { description: (err as Error).message });
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-10 text-center">
        <p className="font-display text-lg font-semibold">Cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-ink/10 bg-white p-6 shadow-press">
      <div>
        <label htmlFor="email" className="block font-display font-semibold text-ink mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded border-2 border-ink/15 px-3 py-2 focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-xs text-ink-mute">
          We&rsquo;ll send your order confirmation and an invoice here.
        </p>
      </div>

      <Button onClick={placeOrder} disabled={!email || loading} className="w-full" size="lg">
        {loading ? "Placing order…" : (
          <>
            Place order <Icon icon="arrow-right" />
          </>
        )}
      </Button>

      <p className="text-sm text-ink-mute text-center">
        Estimated total{" "}
        <span className="font-mono font-bold text-ink">{formatMoneyCents(subtotal)}+</span>{" "}
        (final invoice covers tax, shipping, and any decoration adjustments)
      </p>
      <p className="text-xs text-ink-mute text-center">
        No payment is collected here. Once we receive your order, we&rsquo;ll email an invoice
        and a digital proof for approval before we run the press.
      </p>
    </div>
  );
}
