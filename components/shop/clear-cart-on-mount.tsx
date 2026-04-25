"use client";

import * as React from "react";
import { useCart } from "@/lib/store/cart";

export function ClearCartOnMount() {
  React.useEffect(() => {
    useCart.getState().clear();
  }, []);
  return null;
}
