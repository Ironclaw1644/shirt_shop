"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productSlug: string;
  title: string;
  variant?: string;
  unitPriceCents: number;
  quantity: number;
  image?: string;
  decoration?: {
    method: string;
    placement?: string;
    designId?: string;
    proofUrl?: string;
    artworkFileUrl?: string;
  };
  leadTimeDays?: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clear: () => void;
  subtotalCents: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const match = s.items.find(
            (i) => i.productSlug === item.productSlug && i.variant === item.variant,
          );
          if (match) {
            return {
              items: s.items.map((i) =>
                i === match ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            };
          }
          return { items: [...s.items, item] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty: (id, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
          ),
        })),
      clear: () => set({ items: [] }),
      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "gaph-cart" },
  ),
);
