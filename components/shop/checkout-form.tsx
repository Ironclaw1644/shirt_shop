"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { toast } from "sonner";
import { getStripePromise } from "@/lib/stripe/client";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatMoneyCents } from "@/lib/utils/money";

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#B8142B",
    colorBackground: "#ffffff",
    colorText: "#1A1A1A",
    colorDanger: "#B8142B",
    fontFamily: "Inter, ui-sans-serif, system-ui",
    borderRadius: "6px",
  },
};

export function CheckoutForm() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotalCents());
  const [email, setEmail] = React.useState("");
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [disabled, setDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const startCheckout = React.useCallback(async () => {
    if (!email || items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, items, shippingCents: 0, taxCents: 0 }),
      });
      const data = await res.json();
      if (data.disabled) {
        setDisabled(true);
        setOrderId(data.orderId);
        toast.info("Order recorded", {
          description:
            "Stripe keys aren't configured yet — your order is saved and will be invoiced manually.",
        });
      } else if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
      } else {
        throw new Error(data.error ?? "Unable to start checkout");
      }
    } catch (err) {
      toast.error("Checkout failed", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [email, items]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-10 text-center">
        <p className="font-display text-lg font-semibold">Cart is empty.</p>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="rounded-lg border border-ink/10 bg-paper-warm p-8">
        <h3 className="font-display text-xl font-bold">Order received</h3>
        <p className="mt-2 text-ink-soft">
          Your order #{orderId} has been saved. Our team will follow up with a payment link and
          proof within one business day. Live card checkout becomes available as soon as Stripe keys
          are configured.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
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
            We send receipts, proofs, and shipping updates here.
          </p>
        </div>
        <Button onClick={startCheckout} disabled={!email || loading} className="w-full" size="lg">
          {loading ? "Preparing…" : (
            <>
              Continue to payment <Icon icon="arrow-right" />
            </>
          )}
        </Button>
        <p className="text-sm text-ink-mute text-center">
          Total{" "}
          <span className="font-mono font-bold text-ink">{formatMoneyCents(subtotal)}+</span>{" "}
          (tax and shipping added next step)
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={getStripePromise()} options={{ clientSecret, appearance }}>
      <InnerPayment orderId={orderId!} subtotal={subtotal} />
    </Elements>
  );
}

function InnerPayment({ orderId, subtotal }: { orderId: string; subtotal: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account/orders/${orderId}`,
      },
    });
    if (error) {
      toast.error("Payment failed", { description: error.message });
      setSubmitting(false);
      return;
    }
    router.push(`/account/orders/${orderId}`);
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-ink/10 bg-white p-6 shadow-press">
      <PaymentElement />
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || submitting}>
        {submitting ? "Processing…" : `Pay ${formatMoneyCents(subtotal)}`}
      </Button>
      <p className="text-xs text-ink-mute text-center">
        You&rsquo;ll review a digital proof before any press run begins. Refunds per policy.
      </p>
    </form>
  );
}
