import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { CheckoutSummary } from "@/components/shop/checkout-summary";
import { CheckoutGate } from "@/components/shop/checkout-gate";
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
  if (!user) redirect("/auth/sign-in?next=/checkout");

  return (
    <div className="container py-12 max-w-6xl">
      <Breadcrumbs crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="heading-display mt-6 text-4xl sm:text-5xl">Checkout</h1>

      <CheckoutGate>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,380px]">
          <CheckoutForm />
          <CheckoutSummary />
        </div>
      </CheckoutGate>
    </div>
  );
}
