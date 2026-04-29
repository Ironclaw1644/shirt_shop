import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { CheckoutSummary } from "@/components/shop/checkout-summary";
import { CheckoutGate } from "@/components/shop/checkout-gate";
import { CheckoutAuthBanner } from "@/components/shop/checkout-auth-banner";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  return (
    <div className="container py-12 max-w-6xl">
      <Breadcrumbs crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="heading-display mt-6 text-4xl sm:text-5xl">Checkout</h1>

      <CheckoutGate>
        <div className="mt-8 space-y-6">
          {!user && <CheckoutAuthBanner />}
          <div className="grid gap-10 lg:grid-cols-[1fr,380px]">
            <div>
              {!user && (
                <p className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-3">
                  Or continue as guest
                </p>
              )}
              <CheckoutForm />
            </div>
            <CheckoutSummary />
          </div>
        </div>
      </CheckoutGate>
    </div>
  );
}
