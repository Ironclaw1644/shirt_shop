"use client";

import * as React from "react";
import { useCart } from "./cart";

export function useHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useCartHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    if (useCart.persist?.hasHydrated?.()) {
      setHydrated(true);
      return;
    }
    return useCart.persist?.onFinishHydration?.(() => setHydrated(true));
  }, []);
  return hydrated;
}
