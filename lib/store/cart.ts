"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Decoration = {
  method: string;
  placement?: string;
  /** View on the garment this decoration prints on (e.g. "front", "back"). */
  viewKey?: string;
  /** Human label for the side, used in cart UI. */
  viewLabel?: string;
  designId?: string;
  proofUrl?: string;
  artworkFileUrl?: string;
};

export type CartItem = {
  id: string;
  productSlug: string;
  title: string;
  variant?: string;
  unitPriceCents: number;
  quantity: number;
  image?: string;
  /** Per-side decorations. Single-side items use a one-element array. */
  decorations?: Decoration[];
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

type LegacyCartItem = Omit<CartItem, "decorations"> & {
  decoration?: Decoration;
};

function migrateItem(raw: LegacyCartItem | CartItem): CartItem {
  if ("decorations" in raw && Array.isArray(raw.decorations)) {
    return raw as CartItem;
  }
  const legacy = raw as LegacyCartItem;
  if (legacy.decoration) {
    const { decoration, ...rest } = legacy;
    return { ...rest, decorations: [decoration] };
  }
  return raw as CartItem;
}

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
    {
      name: "gaph-cart",
      version: 2,
      migrate: (state, fromVersion) => {
        if (!state || typeof state !== "object") return state as CartState;
        if (fromVersion < 2) {
          const s = state as { items?: Array<LegacyCartItem | CartItem> };
          return {
            ...(state as object),
            items: (s.items ?? []).map(migrateItem),
          } as CartState;
        }
        return state as CartState;
      },
    },
  ),
);
