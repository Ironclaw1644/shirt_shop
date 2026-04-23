import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { CheckoutSummary } from "@/components/shop/checkout-summary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container py-12 max-w-6xl">
      <Breadcrumbs crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="heading-display mt-6 text-4xl sm:text-5xl">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,380px]">
        <CheckoutForm />
        <CheckoutSummary />
      </div>
    </div>
  );
}
