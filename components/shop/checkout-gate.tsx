"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { useCartHydrated } from "@/lib/store/use-hydrated";

export function CheckoutGate({ children }: { children: React.ReactNode }) {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const router = useRouter();

  React.useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/cart");
  }, [hydrated, items.length, router]);

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (items.length === 0) return null;
  return <>{children}</>;
}
